use serde_json::json;
use worker::*;

use crate::parser;

pub async fn logs<D>(_req: Request, _ctx: RouteContext<D>) -> Result<Response> {
    Response::from_json(&json!({ "message": "Hello, world!"}))
}

pub async fn new_log<D>(mut req: Request, _ctx: RouteContext<D>) -> Result<Response> {
    let form = req.form_data().await?;
    let file = match form.get("file").ok_or("file not found") {
        Ok(file) => file,
        _ => return Response::error("file not found", 400),
    };
    let file = match file {
        FormEntry::File(f) => f,
        _ => return Response::error("file not found", 400),
    };

    let data = file.bytes().await?;
    let log = parser::parse_from_bytes(&data).await?;

    Response::from_json(&json!(log))
}
