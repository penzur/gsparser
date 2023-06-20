use std::borrow::Borrow;
use utils::logit;
use worker::*;

mod handler;
mod utils;

#[event(fetch)]
pub async fn main(req: Request, env: Env, _ctx: worker::Context) -> Result<Response> {
    let now = Date::now();
    utils::set_panic_hook();
    let ip = match req.headers().get("cf-connecting-ip").ok().flatten() {
        Some(ip) => ip,
        None => "127.0.0.1".to_string(),
    };
    let method = &req.method().to_string();
    let path = &req.path().to_string();

    // check if cache exists
    let c = Cache::default();
    if method == "GET" {
        if let Some(cache_resp) = c.get(&req, true).await.ok().flatten() {
            let code = cache_resp.status_code();
            let size = match cache_resp.body() {
                ResponseBody::Body(b) => b.len(),
                _ => 0,
            };

            logit(ip.as_str(), method, path, code, size, now.as_millis());
            return Ok(cache_resp);
        }
    }

    let reqc = req.clone()?;
    let router = Router::new();
    let result = router
        .get("/api/v1", |_req, _ctx| Response::ok("API is up!"))
        .get_async("/api/v1/logs", handler::logs)
        .run(reqc, env)
        .await;

    let resp = match result {
        Ok(resp) => resp,
        Err(_) => return Response::error("request failed", 400),
    };

    let code = resp.status_code();
    let size = match resp.body() {
        ResponseBody::Body(b) => b.len(),
        _ => 0,
    };

    logit(ip.as_str(), method, path, code, size, now.as_millis());

    // cache headers
    let mut headers = Headers::new();
    headers.set("Content-Type", "application/json").ok();
    let mut resp = resp.with_headers(headers);

    // no need to cache for none-GET method
    if method != "GET" {
        return Ok(resp);
    }

    // cache me baby one more time!
    resp.headers_mut()
        .set("Cache-Control", "public, s-max-age=31536000")
        .ok();
    let k = &req.borrow();
    if let Some(resp) = resp.cloned().ok() {
        c.put(*k, resp).await.ok();
    }

    Ok(resp)
}
