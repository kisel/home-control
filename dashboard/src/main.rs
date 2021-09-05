extern crate clap;
use clap::value_t;
use clap::{Arg, App};

mod http_server;
mod actions;
mod mqtt;

fn main() {
    let matches = App::new("MQTT dashboard")
        .about("Web dashboard for sending commands web to mqtt")
        .arg(Arg::with_name("config")
            .short("c")
            .long("config")
            .help("Sets a custom config file")
            .takes_value(true))
        .arg(Arg::with_name("port")
            .short("p")
            .help("HTTP port")
            .default_value("8080")
            .takes_value(true))
        .get_matches();

    mqtt::mqtt_test();
    // Gets a value for config if supplied by user, or defaults to "default.conf"
    let config = matches.value_of("config").unwrap_or("default.conf");
    let port = value_t!(matches, "port", u16).unwrap_or(8080);
    match actions::read_config(config) {
        Ok(_) => println!("Success"),
        Err(e) => println!("Failed {}", e),
    }

    http_server::start_http_server(port);
    println!("App started")
}
