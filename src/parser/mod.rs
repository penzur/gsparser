use worker::*;

pub async fn parse(payload: Vec<u8>) {
    let logs = String::from_utf8(payload.to_vec()).unwrap();
    let logs = logs
        .split("\r\n\r\n")
        .map(|x| x.to_string().split("\r\n").collect::<Vec<&str>>()[0].to_string())
        .collect::<Vec<String>>();
    console_log!("{:?}", logs[0])
}
