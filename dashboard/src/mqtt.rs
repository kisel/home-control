extern crate paho_mqtt as mqtt;

use std::process;

pub fn mqtt_test() {
    // Create a client & define connect options
    let cli = mqtt::AsyncClient::new("tcp://mqtt:1883").unwrap_or_else(|err| {
        println!("Error creating the client: {}", err);
        process::exit(1);
    });

    let conn_opts = mqtt::ConnectOptions::new();

    // Connect and wait for it to complete or fail
    if let Err(e) = cli.connect(conn_opts).wait() {
        println!("Unable to connect: {:?}", e);
        process::exit(1);
    }

    // Create a message and publish it
    println!("Publishing a message on the 'test' topic");
    let msg = mqtt::Message::new("test", "Hello world!", 0);
    let tok = cli.publish(msg);

    if let Err(e) = tok.wait() {
        println!("Error sending message: {:?}", e);
    }

    // Disconnect from the broker
    let tok = cli.disconnect(None);
    tok.wait().unwrap();
}