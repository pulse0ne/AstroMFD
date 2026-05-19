use serde::{Deserialize, Serialize};
use crate::widget::Widget;
use crate::widget::base::WidgetBase;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PanelAttributes {
    #[serde(flatten)]
    pub widget: WidgetBase,
    #[serde(default)]
    pub widgets: Vec<Widget>,
}
