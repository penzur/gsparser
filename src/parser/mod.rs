use regex::Regex;
use worker::*;

#[derive(Debug)]
#[allow(dead_code)]
struct Entry<'a> {
    attacker: (&'a str, &'a str),
    points: u8,
    target: (&'a str, &'a str),
}

pub async fn parse(payload: Vec<u8>) {
    let logs = String::from_utf8(payload.to_vec()).unwrap();
    let logs = logs
        .split("\r\n\r\n")
        .map(|x| x.split("\r\n").collect::<Vec<&str>>()[0])
        .collect::<Vec<&str>>();
    console_log!("logs: {:?}", logs[0]);

    let re = Regex::new(r"\[(.*?)\] (.*?)(\((\d+) grade\)) → Attack \[(.*?)\] (.*)").unwrap();
    let entries = logs
        .iter()
        .filter_map(|e| {
            if let Some(caps) = re.captures(e) {
                Some(Entry {
                    attacker: (caps.get(1).unwrap().as_str(), caps.get(2).unwrap().as_str()),
                    points: caps.get(4).unwrap().as_str().parse::<u8>().unwrap(),
                    target: (caps.get(5).unwrap().as_str(), caps.get(6).unwrap().as_str()),
                })
            } else {
                None
            }
        })
        .collect::<Vec<Entry>>();
    console_log!("entries: {:?}", entries)
}
