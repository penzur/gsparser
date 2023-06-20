use worker::*;

pub async fn logs<D>(_req: Request, _ctx: RouteContext<D>) -> Result<Response> {
    Response::ok("Hello, world!")
}
