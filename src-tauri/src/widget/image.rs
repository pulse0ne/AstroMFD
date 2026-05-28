use serde::{Deserialize, Serialize};
use crate::widget::base::WidgetBase;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageAttributes {
    #[serde(flatten)]
    pub widget: WidgetBase,
    pub file: String,
}
