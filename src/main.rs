/*
    Generates a static website for displaying PenguinMod/TurboWarp extensions.
    Copyright (C) 2025 Steve0Greatness

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, only version 3 of the
    License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

use std::{env, fs, path::Path};
use serde::{Deserialize, Serialize};
use minijinja::context;

#[derive(Deserialize, Serialize, Debug)]
struct Extension {
    path: String,
    title: String,
    description: String,

    image: String,
    versions: Versions,

    contributors: Vec<Contributor>,

    license: License,
    incompatible: Vec<Compatibility>,

    documentation: Option<String>,
    website: Option<String>,
    source: Option<String>,
    examples: Option<Vec<Example>>
}

#[derive(Deserialize, Serialize, Debug)]
struct Versions {
    current: String,
    past: Vec<String>
}

#[derive(Deserialize, Serialize, Debug)]
struct Contributor {
    name: String,
    website: Option<String>,
    notes: Option<String>
}
#[derive(Deserialize, Serialize, Debug)]
struct License {
    extension: String,
    image: String
}

#[derive(Deserialize, Serialize, Debug)]
struct Compatibility {
    #[serde(rename = "type")]
    compat_type: String,

    value: String,

    #[serde(default)]
    broken: bool,

    reason: Option<String>
}

#[derive(Deserialize, Serialize, Debug)]
struct Example {
    name: String,
    description: String,
    path: String
}

fn copy_recurse(src: impl AsRef<Path>, dst: impl AsRef<Path>) -> std::io::Result<()> {
    fs::create_dir_all(&dst)?;
    for entry in fs::read_dir(&src)? {
        let entry = entry?;
        let path = entry.path();

        let output_path = dst.as_ref().join(entry.file_name());
        if path.is_file() {
            fs::copy(path, output_path)?;
            continue;
        }
        copy_recurse(path, output_path)?;
    }
    Ok(())
}

fn main() {
    let extensions_file = match env::var("EXTENSIONS_FILE") {
        Ok(val) => val,
        Err(env::VarError::NotPresent) => String::from("extensions.json5"),
        Err(env::VarError::NotUnicode(_)) => panic!("Value in EXTENSIONS_FILE is not a valid unicode string.")
    };
    let extensions_file = fs::read_to_string(&extensions_file).unwrap();
    
    let extensions: Vec<Extension> = match json5::from_str(&extensions_file) {
        Ok(exts) => exts,
        Err(e) => panic!("There was a fatal error: {e}")
    };

    let extensions_directory = match env::var("EXTENSIONS_DIR") {
        Ok(val) => val,
        Err(env::VarError::NotPresent) => String::from("extensions"),
        Err(env::VarError::NotUnicode(_)) => panic!("Extension directory must be valid unicode.")
    };
    let build_directory = match env::var("BUILD_DIR") {
        Ok(val) => val,
        Err(env::VarError::NotPresent) => String::from("build"),
        Err(env::VarError::NotUnicode(_)) => panic!("Build directory must be valid unicode.")
    };
    let static_directory = match env::var("STATIC_DIR") {
        Ok(val) => val,
        Err(env::VarError::NotPresent) => String::from("public"),
        Err(env::VarError::NotUnicode(_)) => panic!("Static directory must be valid unicode.")
    };
    copy_recurse(&static_directory, &build_directory);
    copy_recurse(&extensions_directory, Path::new(&build_directory).join(&extensions_directory));

    let index_view = match env::var("INDEX_VIEW") {
        Ok(val) => val,
        Err(env::VarError::NotPresent) => String::from("index.html"),
        Err(env::VarError::NotUnicode(_)) => panic!("Index view must be a valid unicode string!")
    };
    println!("{}", index_view);
    let index_view = fs::read_to_string(&index_view).unwrap();

    let mut env = minijinja::Environment::new();
    env.add_template("index.html", &index_view);
    let tmpl = env.get_template("index.html").unwrap();

    let index_rendered = tmpl.render(context!(
        extensions => extensions,
        extensions_directory => extensions_directory
    )).unwrap();

    fs::write(Path::new(&build_directory).join("index.html"), &index_rendered).unwrap();
}
