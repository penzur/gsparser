use serde::{Deserialize, Serialize};

use regex::Regex;
use std::collections::HashMap;
use worker::*;

use crate::utils::hash_bytes;

#[derive(Debug, Serialize)]
pub struct Log {
    pub server: String,
    pub date: f64,
    pub hash: String,
    pub guilds: Vec<Guild>,
    pub players: Vec<Player>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct LogsItem<G, P> {
    pub server: String,
    pub date: f64,
    pub winner: G,
    pub mvp: P,
}
pub type Logs<G, P> = Vec<LogsItem<G, P>>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerEntity {
    pub guild: String,
    pub name: String,
}

#[derive(Debug)]
pub struct Record {
    pub attacker: PlayerEntity,
    pub points: u8,
    pub target: PlayerEntity,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct Guild {
    pub name: String,
    pub points: u32,
    pub resu: u32,
    pub members: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct Player {
    pub name: String,
    pub guild: String,
    pub points: u32,
    pub resu: u32,
    pub kills: Vec<Vec<PlayerEntity>>,
    pub deaths: Vec<PlayerEntity>,
}

impl Log {
    pub fn with_server(mut self, server: &str) -> Self {
        self.server = server.to_owned();
        self
    }

    pub fn with_date(mut self, date: f64) -> Self {
        self.date = date;
        self
    }
}

pub async fn from_bytes(bytes: &[u8]) -> Result<Log> {
    let lines = String::from_utf8(bytes.to_vec())
        .map_err(|_| worker::Error::RustError("Could not parse data".to_owned()))?;
    // since rust regexp does not support lookaheads, then we'll do it the
    // good ol find-and-replace way XD
    let lines = lines
        .replace("→ ", "")
        .replace("?? ", "")
        .replace("Guild Master ", "")
        .replace("Defender ", "")
        .replace("\r", "");
    let lines = lines
        .split("\n\n")
        .map(|x| x.split("\n").collect::<Vec<&str>>()[0])
        .collect::<Vec<&str>>();

    let rx = Regex::new(r"\[(.*?)\] (.*?)(\((\d+) grade\)) Attack \[(.*?)\] (.*)")
        .map_err(|_| Error::RustError("Invalid data format".to_owned()))?;

    let entries = lines
        .iter()
        .filter_map(|e| {
            if let Some(caps) = rx.captures(e) {
                let attacker = PlayerEntity {
                    guild: caps.get(1).map_or("", |m| m.as_str()).trim().to_string(),
                    name: caps.get(2).map_or("", |m| m.as_str()).trim().to_owned(),
                };
                let points = caps
                    .get(4)
                    .and_then(|m| m.as_str().parse::<u8>().ok())
                    .unwrap_or_default();
                let target = PlayerEntity {
                    guild: caps.get(5).map_or("", |m| m.as_str()).trim().to_string(),
                    name: caps.get(6).map_or("", |m| m.as_str()).trim().to_owned(),
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

    if entries.is_empty() {
        return Err(Error::RustError("Invalid data format".to_owned()));
    }

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
    guilds.sort_by(|a, b| (b.points + b.resu).cmp(&(a.points + a.resu)));

    Ok(Log {
        guilds,
        players,
        server: "".to_owned(),
        date: 0.0,
        hash: hash_bytes(&bytes),
    })
}
