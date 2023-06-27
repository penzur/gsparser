use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::HashMap;
use worker::{js_sys::Date, wasm_bindgen::JsValue, *};

use crate::{
    parser::{self, Guild, Player},
    utils::hash_bytes,
};

#[derive(Debug, Serialize)]
struct LogFromDB<G, P> {
    server: String,
    date: i64,
    guilds: G,
    players: P,
}
type Results<G, P> = Vec<LogFromDB<G, P>>;

pub async fn logs<D>(req: Request, ctx: RouteContext<D>) -> Result<Response> {
    // get query string first
    let url = match req.url() {
        Ok(q) => q,
        Err(_) => return Response::error("query string required", 400),
    };

    // convert to hashmap
    let queries = url.query_pairs().into_iter().collect::<HashMap<_, _>>();
    let server = match queries.get("server") {
        Some(s) => s.to_string(),
        None => "".to_string(),
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
                SELECT server, date, guilds, players
                FROM logs
                WHERE COALESCE(server = CASE WHEN ?1 = '' THEN NULL ELSE ?1 END, TRUE)
                ORDER BY date DESC
            "#,
        )
        .bind(&[JsValue::from_str(&server.as_ref())])
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

    let results: Results<String, String> = result.results::<LogFromDB<String, String>>()?;
    let results: Results<Vec<Guild>, Vec<Player>> = results
        .into_iter()
        .map(|r| {
            let guilds: Vec<Guild> = serde_json::from_str(&r.guilds).unwrap_or_default();
            let players: Vec<Player> = serde_json::from_str(&r.players).unwrap_or_default();
            LogFromDB {
                server: r.server,
                date: r.date,
                guilds,
                players,
            }
        })
        .collect();
    Response::from_json(&json!({ "results": results }))
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
    let name_str = name_str.split("_").last().unwrap_or_default();
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
    let hash = hash_bytes(&data);
    let log = parser::parse_from_bytes(&data).await?;

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
            hash.as_str().into(),
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
        "date": date,
        "hash": hash
    }))
}
