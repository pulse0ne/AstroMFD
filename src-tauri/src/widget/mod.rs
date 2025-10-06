use serde::{Deserialize, Serialize};

pub mod base;
pub mod button;
pub mod label;
pub mod panel;
pub mod screen_set;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum Widget {
    Button(button::ButtonAttributes),
    Label(label::LabelAttributes),
    Panel(panel::PanelAttributes),
}
