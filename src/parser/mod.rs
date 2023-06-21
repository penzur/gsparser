use std::collections::HashMap;

use regex::Regex;
use worker::*;

#[derive(Debug)]
struct Entry<'a> {
    attacker: (&'a str, &'a str),
    points: u8,
    target: (&'a str, &'a str),
}

#[derive(Debug)]
struct Guild<'a> {
    name: &'a str,
    points: u32,
    resu: u32,
    members: Vec<&'a str>,
}

#[derive(Debug)]
struct Player<'a> {
    name: &'a str,
    guild: &'a str,
    points: u32,
    kills: Vec<Vec<(&'a str, &'a str)>>,
    deaths: Vec<Vec<(&'a str, &'a str)>>,
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

    let mut guild_map = HashMap::new();
    let mut player_map = HashMap::new();

    // loop entries
    for entry in entries {
        // attacker
        let attacker = player_map.entry(entry.attacker.1).or_insert(Player {
            name: entry.attacker.1,
            guild: entry.attacker.0,
            points: 0,
            kills: Vec::new(),
            deaths: Vec::new(),
        });
        attacker.points += entry.points as u32;
        let aidx = {
            let len = attacker.kills.len();
            if len == 0 {
                attacker.kills.push(Vec::new());
                0
            } else {
                len - 1
            }
        };
        attacker.kills[aidx].push(entry.target);

        // target
        let target = player_map.entry(entry.target.1).or_insert(Player {
            name: entry.target.1,
            guild: entry.target.0,
            points: 0,
            kills: Vec::new(),
            deaths: Vec::new(),
        });
        let tidx = {
            let len = target.deaths.len();
            if len == 0 {
                target.deaths.push(Vec::new());
                0
            } else {
                len - 1
            }
        };
        target.deaths[tidx].push(entry.attacker);

        // guild
        let guild = guild_map.entry(entry.attacker.0).or_insert(Guild {
            name: entry.attacker.0,
            points: 0,
            resu: 0,
            members: Vec::new(),
        });
        guild.points += entry.points as u32;
        if !guild.members.contains(&entry.attacker.1) {
            guild.members.push(entry.attacker.1);
        }
    }

    // sort players by points in descending order
    let mut players = player_map
        .into_iter()
        .map(|(_, v)| v)
        .collect::<Vec<Player>>();
    players.sort_by(|a, b| b.points.cmp(&a.points));

    // get the max deaths
    let max_deaths = players
        .iter()
        .map(|p| p.deaths.len())
        .max()
        .unwrap_or_default();

    // loop trough players and calculate their deaths against the max_deaths
    // and add the result to player guild's resu points
    for player in players.iter_mut() {
        let deaths = player.deaths.len();
        let resu = max_deaths - deaths;
        if let Some(guild) = guild_map.get_mut(player.guild) {
            guild.resu += resu as u32;
        }
    }

    // convert guild_map to vector
    let mut guilds = guild_map
        .into_iter()
        .map(|(_, v)| v)
        .collect::<Vec<Guild>>();
    guilds.sort_by(|a, b| b.points.cmp(&a.points));

    console_log!("{:?}", guilds[0]);
    console_log!("{:?}", players[0]);

    Ok(())
}
