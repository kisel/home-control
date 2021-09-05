#[allow(dead_code)]
#[allow(unused_variables)]

use serde::{Serialize, Deserialize};
use std::error::Error;

#[derive(Debug, PartialEq, Serialize, Deserialize)]
struct Actions {
    actions: Vec<Action>
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
struct Action {
    id: String,
    label: String,

    #[serde(default)]
    commands: Vec<Command>,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
struct Command {
    topic: String,
    payload: String,
}

pub fn read_config(filename: &str) -> Result<(), Box<dyn Error>> {
    let res = std::fs::read_to_string(filename)?;
    println!("got {}", res);
    let actions: Actions = serde_yaml::from_str(&res)?;
    for v in actions.actions.iter() {
        println!("{} --> {}", v.id, v.label);
        for c in v.commands.iter() {
            println!("  {} {}", c.topic, c.payload)
        }
    }
    Ok(())
}

