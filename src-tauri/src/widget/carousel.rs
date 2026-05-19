use serde::{Deserialize, Serialize};
use crate::widget::Widget;
use crate::widget::base::WidgetBase;

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
}
