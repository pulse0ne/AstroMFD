use serde::{Deserialize, Serialize};
use crate::widget::Widget;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScreenSize {
    pub width: u64,
    pub height: u64,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Screen {
    pub id: String,
    pub name: String,
    pub background_color: String,
    pub widgets: Vec<Widget>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScreenSet {
    pub id: String,
    pub name: String,
    pub size: ScreenSize,
    pub screens: Vec<Screen>,
}
