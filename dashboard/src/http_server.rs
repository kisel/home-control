use warp::Filter;

#[tokio::main]
pub async fn start_http_server(port: u16) {
    // GET /hello/warp => 200 OK with body "Hello, warp!"
    let hello = warp::path!("hello" / String)
        .map(|name| format!("Hello, {}!", name));

    warp::serve(hello)
        .run(([0, 0, 0, 0], port))
        .await;
}
