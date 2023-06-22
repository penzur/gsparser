use cfg_if::cfg_if;
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
    console_log!(
        "{} - - [{:?}] \"{} {}\" {} {} {}ms",
        ip,
        Date::now().to_string(),
        method,
        path,
        code,
        size,
        Date::now().as_millis() - start_time,
    );
}
