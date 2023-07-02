use serde_json::json;
use std::collections::HashMap;
use worker::{js_sys::Date, wasm_bindgen::JsValue, *};

use crate::log::{from_bytes, Guild, Logs, LogsItem, Player};

pub async fn logs<D>(req: Request, ctx: RouteContext<D>) -> Result<Response> {
    // get query string first
    let url = match req.url() {
        Ok(q) => q,
        Err(_) => return Response::error("query string required", 400),
    };

    // convert to hashmap
    let queries = url.query_pairs().into_iter().collect::<HashMap<_, _>>();
    let server = match queries.get("server") {
        Some(s) => {
            let s = s.to_string();
            if s.is_empty() {
                JsValue::null()
            } else {
                s.into()
            }
        }
        None => JsValue::null(),
    };
    let last_date = match queries.get("last_date") {
        Some(s) => s.to_string().parse::<f64>().unwrap_or_default().into(),
        None => JsValue::null(),
    };
    let max_rows = match queries.get("max_rows") {
        Some(s) => s.to_string().parse::<u32>().unwrap_or_default().into(),
        None => JsValue::null(),
    };

    // d1 bindings
    let d1 = match ctx.d1("siegelogs") {
        Ok(d) => d,
        Err(e) => {
            console_error!("d1 err: {:?}", e);
            return Response::error("request failed", 400);
        }
    };

    // prepare query
    let stmt = d1
        .prepare(
            r#"
                SELECT server, date,
                json_extract(guilds, '$[0]') winner,
                json_extract(players, '$[0]') mvp
                FROM logs
                WHERE COALESCE(server = ?1, TRUE)
                AND (date < ?2 OR ?2 IS NULL)
                ORDER BY date DESC
                LIMIT COALESCE(?3, 20)
            "#,
        )
        .bind(&[server, last_date, max_rows])
        .map_err(|e| {
            console_error!("query err: {:?}", e);
            "request failed"
        })?;

    let result = stmt.all().await.map_err(|e| {
        console_error!("query err: {:?}", e);
        "request failed"
    })?;

    if !result.success() {
        return Response::error("request failed", 400);
    }

    let results: Logs<String, String> = result.results()?;
    let results: Logs<Guild, Player> = results
        .into_iter()
        .map(|r| {
            let winner = serde_json::from_str(&r.winner).unwrap_or_default();
            let mvp = serde_json::from_str(&r.mvp).unwrap_or_default();
            LogsItem {
                server: r.server,
                date: r.date,
                winner,
                mvp,
            }
        })
        .collect();
    Response::from_json(&json!(results))
}

pub async fn new<D>(mut req: Request, ctx: RouteContext<D>) -> Result<Response> {
    let form = req.form_data().await?;
    let server = match form.get("server") {
        Some(FormEntry::Field(s)) => s,
        _ => return Response::error("server is required", 400),
    };
    let file = match form.get("file").ok_or("file not found") {
        Ok(file) => file,
        _ => return Response::error("file not found", 400),
    };
    let file = match file {
        FormEntry::File(f) => f,
        _ => return Response::error("file not found", 400),
    };

    let name_str = file.name().to_owned();
    let name_str = name_str
        .split(".")
        .next()
        .unwrap_or_default()
        .split("_")
        .last()
        .unwrap_or_default();
    // check for valid date yyyymmdd
    let rx = regex::Regex::new(r"^\d{8}$").unwrap();
    let date = {
        if !rx.is_match(name_str) {
            Date::now()
        } else {
            let yr = &name_str[0..4];
            let mo = &name_str[4..6];
            let dy = &name_str[6..8];
            // create rust date
            Date::new_with_year_month_day(
                yr.parse().unwrap_or_default(),
                mo.parse().unwrap_or_default(),
                dy.parse().unwrap_or_default(),
            )
            .get_time()
        }
    };

    // parse file
    let data = &file.bytes().await.map_err(|_| "invalid file format")?;
    let log = from_bytes(&data)
        .await?
        .with_server(&server)
        .with_date(date);

    // d1 bindings
    let d1 = match ctx.d1("siegelogs") {
        Ok(d) => d,
        Err(e) => {
            console_error!("d1 err: {:?}", e);
            return Response::error("request failed", 400);
        }
    };

    let query = d1
        .prepare(
            r#"
                INSERT INTO logs (server, date, hash, guilds, players)
                VALUES (?1, ?2, ?3, json(?4), json(?5))
            "#,
        )
        .bind(&[
            server.clone().into(),
            date.into(),
            log.hash.into(),
            JsValue::from_str(json!(log.guilds).to_string().as_ref()),
            JsValue::from_str(json!(log.players).to_string().as_ref()),
        ])
        .map_err(|e| {
            console_error!("query err: {:?}", e);
            "request failed"
        })?;

    let result = match query.run().await {
        Ok(r) => r,
        Err(e) => {
            let mut error_message = "request failed";
            if e.to_string().contains("UNIQUE") {
                error_message = "duplicate entry";
            }
            console_error!("query err: {:?}", e);
            return Response::error(error_message, 400);
        }
    };

    if !result.success() {
        console_error!("result error");
        return Response::error("request failed", 400);
    }

    Response::from_json(&json!({
        "server": server,
        "date": date
    }))
}
