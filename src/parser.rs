use serde::Serialize;
use sha2::{Digest, Sha256};
use std::collections::HashMap;

use regex::Regex;
use worker::*;

#[derive(Debug, Clone, Serialize)]
struct PlayerEntity {
    guild: String,
    name: String,
}

#[derive(Debug)]
struct Record {
    attacker: PlayerEntity,
    points: u8,
    target: PlayerEntity,
}

#[derive(Debug, Serialize)]
pub struct Guild {
    name: String,
    points: u32,
    resu: u32,
    members: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct Player {
    name: String,
    guild: String,
    points: u32,
    resu: u32,
    kills: Vec<Vec<PlayerEntity>>,
    deaths: Vec<PlayerEntity>,
}

#[derive(Debug, Serialize)]
pub struct Log {
    pub guilds: Vec<Guild>,
    pub players: Vec<Player>,
    pub hash: String,
}

fn hash_bytes(bytes: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    let result = hasher.finalize();
    format!("{:x}", result)
}

pub async fn parse_from_bytes(bytes: &[u8]) -> Result<Log> {
    let hash = hash_bytes(&bytes);
    let lines = String::from_utf8(bytes.to_vec())
        .map_err(|_| worker::Error::RustError("Could not parse data".to_owned()))?;
    let lines = lines
        .split("\r\n\r\n")
        .map(|x| x.split("\r\n").collect::<Vec<&str>>()[0])
        .collect::<Vec<&str>>();

    let rx = Regex::new(r"\[(.*?)\] (.*?)(\((\d+) grade\)) → Attack \[(.*?)\] (.*)")
        .map_err(|_| Error::RustError("Invalid data format".to_owned()))?;

    let entries = lines
        .iter()
        .filter_map(|e| {
            if let Some(caps) = rx.captures(e) {
                let attacker = PlayerEntity {
                    guild: caps.get(1).map_or("", |m| m.as_str()).to_string(),
                    name: caps
                        .get(2)
                        .map_or("", |m| m.as_str())
                        .replace("Guild Master ", ""),
                };
                let points = caps
                    .get(4)
                    .and_then(|m| m.as_str().parse::<u8>().ok())
                    .unwrap_or_default();
                let target = PlayerEntity {
                    guild: caps.get(5).map_or("", |m| m.as_str()).to_string(),
                    name: caps
                        .get(6)
                        .map_or("", |m| m.as_str())
                        .replace("Defender ", ""),
                };
                Some(Record {
                    attacker,
                    points,
                    target,
                })
            } else {
                None
            }
        })
        .collect::<Vec<Record>>();

    let mut guild_map = HashMap::new();
    let mut player_map = HashMap::new();

    for entry in entries {
        let attacker = player_map
            .entry(entry.attacker.name.clone())
            .or_insert(Player {
                name: entry.attacker.name.clone(),
                guild: entry.attacker.guild.clone(),
                points: 0,
                resu: 0,
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
        attacker.kills[aidx].push(entry.target.clone());

        let target = player_map
            .entry(entry.target.name.clone())
            .or_insert(Player {
                name: entry.target.name.clone(),
                guild: entry.target.guild.clone(),
                points: 0,
                resu: 0,
                kills: Vec::new(),
                deaths: Vec::new(),
            });
        target.deaths.push(entry.attacker.clone());

        let guild = guild_map
            .entry(entry.attacker.guild.clone())
            .or_insert(Guild {
                name: entry.attacker.guild.clone(),
                points: 0,
                resu: 0,
                members: Vec::new(),
            });
        guild.points += entry.points as u32;
        if !guild.members.contains(&entry.attacker.name) {
            guild.members.push(entry.attacker.name.clone());
        }
    }

    let mut players = player_map
        .into_iter()
        .map(|(_, v)| v)
        .collect::<Vec<Player>>();
    players.sort_by(|a, b| b.points.cmp(&a.points));

    let max_deaths = players
        .iter()
        .map(|p| p.deaths.len())
        .max()
        .unwrap_or_default();

    for player in players.iter_mut() {
        let deaths = player.deaths.len();
        player.resu = (max_deaths - deaths) as u32;
        if let Some(guild) = guild_map.get_mut(&player.guild) {
            guild.resu += player.resu;
        }
    }

    let mut guilds = guild_map
        .into_iter()
        .map(|(_, v)| v)
        .collect::<Vec<Guild>>();
    guilds.sort_by(|a, b| b.points.cmp(&a.points));

    Ok(Log {
        guilds,
        players,
        hash,
    })
}
