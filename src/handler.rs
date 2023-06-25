use serde_json::json;
use worker::{js_sys::Date, wasm_bindgen::JsValue, *};

use crate::{parser, utils::hash_bytes};

pub async fn logs<D>(_req: Request, _ctx: RouteContext<D>) -> Result<Response> {
    Response::from_json(&json!({ "message": "Hello, world!"}))
}

pub async fn new_log<D>(mut req: Request, ctx: RouteContext<D>) -> Result<Response> {
    let form = req.form_data().await?;
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

    let data = &file.bytes().await?;
    let hash = hash_bytes(&data);
    let log = parser::parse_from_bytes(&data).await?;
    console_log!("before d1");
    let d1 = ctx.env.d1("DB")?;
    console_log!("after 1");
    let query = d1
        .prepare(
            "INSERT INTO logs (server, date, hash, guilds, players) VALUES (?1, ?2, ?3, ?4, ?5)",
        )
        .bind(&[
            "aegis-flyff".into(),
            date.into(),
            JsValue::from_str(hash.as_str()),
            JsValue::from_str(json!(log.guilds).as_str().unwrap_or("")),
            JsValue::from_str(json!(log.players).as_str().unwrap_or("")),
        ])?;
    let result = query.run().await?;
    if let Some(err) = result.error() {
        console_log!("Error: {:?}", err);
        return Response::error("Request failed", 400);
    }

    Response::from_json(&json!({
        "server": "aegis-flyff",
        "date": date,
        "hash": hash
    }))
}
