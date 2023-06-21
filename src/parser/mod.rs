use regex::Regex;
use worker::*;

#[derive(Debug)]
#[allow(dead_code)]
struct Entry<'a> {
    attacker: (&'a str, &'a str),
    points: u8,
    target: (&'a str, &'a str),
}

pub async fn parse(payload: Vec<u8>) -> Result<()> {
    let logs = String::from_utf8(payload.to_vec())
        .map_err(|_| worker::Error::RustError("Could not parse payload".to_owned()))?;
    let logs = logs
        .split("\r\n\r\n")
        .map(|x| x.split("\r\n").collect::<Vec<&str>>()[0])
        .collect::<Vec<&str>>();

    let rx = Regex::new(r"\[(.*?)\] (.*?)(\((\d+) grade\)) → Attack \[(.*?)\] (.*)")
        .map_err(|_| Error::RustError("Invalid payload format".to_owned()))?;

    let entries = logs
        .iter()
        .filter_map(|e| {
            if let Some(caps) = rx.captures(e) {
                let attacker = (
                    caps.get(1).map_or("", |m| m.as_str()),
                    caps.get(2).map_or("", |m| m.as_str()),
                );
                let points = caps
                    .get(4)
                    .and_then(|m| m.as_str().parse::<u8>().ok())
                    .unwrap_or_default();
                let target = (
                    caps.get(5).map_or("", |m| m.as_str()),
                    caps.get(6).map_or("", |m| m.as_str()),
                );
                Some(Entry {
                    attacker,
                    points,
                    target,
                })
            } else {
                None
            }
        })
        .collect::<Vec<Entry>>();

    console_log!("{:?}", entries);

    Ok(())
}
