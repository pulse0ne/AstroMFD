use serde::{Deserialize, Serialize};
use crate::widget::Widget;
use crate::widget::base::{ShapeAttributes, WidgetBase, WidgetIcon};

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CarouselPage {
    pub id: String,
    pub widgets: Vec<Widget>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum CarouselNavigation {
    #[default]
    Swipe,
    Buttons,
    Both,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "kebab-case")]
pub enum CarouselButtonCorner {
    TopLeft,
    TopRight,
    #[default]
    BottomLeft,
    BottomRight,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CarouselPageButtonPressed {
    #[serde(default)]
    pub shape: serde_json::Value,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CarouselPageButton {
    pub id: String,
    pub corner: CarouselButtonCorner,
    #[serde(default = "default_margin")]
    pub margin: f64,
    pub shape: ShapeAttributes,
    pub icon: WidgetIcon,
    #[serde(default)]
    pub pressed: CarouselPageButtonPressed,
}

fn default_margin() -> f64 {
    6.0
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CarouselButtons {
    pub previous: CarouselPageButton,
    pub next: CarouselPageButton,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CarouselAttributes {
    #[serde(flatten)]
    pub widget: WidgetBase,
    pub pages: Vec<CarouselPage>,
    #[serde(default)]
    pub active_page_index: usize,
    #[serde(default)]
    pub navigation: CarouselNavigation,
    #[serde(default)]
    pub buttons: CarouselButtons,
}
