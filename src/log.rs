use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Log<G, P> {
    pub server: String,
    pub date: i64,
    pub winner: Option<G>,
    pub mvp: Option<P>,
}
pub type List<G, P> = Vec<Log<G, P>>;

#[derive(Debug, Serialize)]
pub struct Leaderboard {
    pub guilds: Vec<Guild>,
    pub players: Vec<Player>,
}

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
