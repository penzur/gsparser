use serde_json::json;
use utils::logit;
use worker::*;

mod handler;
mod log;
mod utils;

#[event(fetch, respond_with_errors)]
pub async fn main(req: Request, env: Env, _ctx: worker::Context) -> Result<Response> {
    let now = Date::now();
    utils::set_panic_hook();
    let ip = match req.headers().get("cf-connecting-ip").ok().flatten() {
        Some(ip) => ip,
        None => "127.0.0.1".to_string(),
    };
    let method = req.method().to_string();
    let path = req.path().to_string();
    let key = req.url()?.to_string();

    // check if cache exists
    let c = Cache::default();
    if method == "GET" {
        if let Some(cache_resp) = c.get(&key, true).await.ok().flatten() {
            let code = cache_resp.status_code();
            let size = match cache_resp.body() {
                ResponseBody::Body(b) => b.len(),
                _ => 0,
            };

            logit(ip.as_str(), &method, &path, code, size, now.as_millis());
            return Ok(cache_resp);
        }
    }

    let router = Router::new();
    let result = router
        // GET
        .get("/api/v1", |_req, _ctx| {
            Response::from_json(&json!({ "status" : "ok" }))
        })
        .get_async("/api/v1/logs", handler::all_logs)
        .get_async("/api/v1/servers", handler::all_servers)
        .get_async("/api/v1/logs/:server/:date", handler::log)
        // POST
        .post_async("/api/v1/logs", handler::new)
        .run(req, env)
        .await;

    let mut resp = match result {
        Ok(rsp) => rsp,
        Err(_) => return Response::error("Request failed", 400),
    };

    let code = resp.status_code();
    let size = match resp.body() {
        ResponseBody::Body(b) => b.len(),
        _ => 0,
    };

    logit(ip.as_str(), &method, &path, code, size, now.as_millis());

    resp.headers_mut()
        .set("Content-Type", "application/json; charset=utf-8")
        .ok();

    if method != "GET" {
        let keyc = key.clone();
        if let Ok(_) = c.delete(key, true).await {
            console_log!("cache has been purged! {keyc}");
        }
        return Ok(resp);
    }

    let result = match resp.body() {
        ResponseBody::Body(b) => Response::from_bytes(b.to_owned()),
        _ => return Ok(resp),
    };
    if let Ok(mut cache_resp) = result {
        cache_resp
            .headers_mut()
            .set("Content-Type", "application/json; charset=utf-8")
            .ok();
        cache_resp
            .headers_mut()
            .set("Cache-Control", "public, s-max-age=3600") // 1 week
            .ok();
        c.put(&key, cache_resp).await.ok();
    }

    Ok(resp)
}
