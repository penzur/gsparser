use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct ListLog<G, P> {
    pub server: String,
    pub date: i64,
    pub winner: G,
    pub mvp: P,
}
pub type List<G, P> = Vec<ListLog<G, P>>;
