use serde::Serialize;

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FontEntry {
    pub name: String,
    pub category: String,
}

pub fn list_fonts() -> Vec<FontEntry> {
    vec![
        FontEntry { name: "Inter".into(), category: "sans-serif".into() },
        FontEntry { name: "Roboto".into(), category: "sans-serif".into() },
        FontEntry { name: "Open Sans".into(), category: "sans-serif".into() },
        FontEntry { name: "Montserrat".into(), category: "sans-serif".into() },
        FontEntry { name: "Oswald".into(), category: "sans-serif".into() },
        FontEntry { name: "JetBrains Mono".into(), category: "monospace".into() },
        FontEntry { name: "Fira Code".into(), category: "monospace".into() },
        FontEntry { name: "Source Code Pro".into(), category: "monospace".into() },
        FontEntry { name: "Orbitron".into(), category: "display".into() },
        FontEntry { name: "Rajdhani".into(), category: "display".into() },
        FontEntry { name: "Exo 2".into(), category: "display".into() },
        FontEntry { name: "Share Tech Mono".into(), category: "display".into() },
        FontEntry { name: "Black Ops One".into(), category: "display".into() },
        FontEntry { name: "Merriweather".into(), category: "serif".into() },
        FontEntry { name: "Playfair Display".into(), category: "serif".into() },
    ]
}
