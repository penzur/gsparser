use cfg_if::cfg_if;
use chrono::{DateTime, Local};
use sha2::{Digest, Sha256};
use worker::*;

cfg_if! {
    // https://github.com/rustwasm/console_error_panic_hook#readme
    if #[cfg(feature = "console_error_panic_hook")] {
        extern crate console_error_panic_hook;
        pub use self::console_error_panic_hook::set_once as set_panic_hook;
    } else {
        #[inline]
        pub fn set_panic_hook() {}
    }
}

pub fn logit(ip: &str, method: &str, path: &str, code: u16, size: usize, start_time: u64) {
    let current_datetime: DateTime<Local> = Local::now();
    let formatted_date = current_datetime.format("%d/%b/%Y:%H:%M:%S %z");
    console_log!(
        "{} - - [{}] \"{} {}\" {} {} {}ms",
        ip,
        formatted_date,
        method,
        path,
        code,
        size,
        Date::now().as_millis() - start_time,
    );
}

pub fn hash_bytes(bytes: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    let result = hasher.finalize();
    format!("{:x}", result)
}
