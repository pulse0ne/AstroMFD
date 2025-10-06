use serde::{Deserialize, Serialize};
use crate::widget::base::{TextAttributes, WidgetBase};

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LabelAttributes {
    #[serde(flatten)]
    pub widget: WidgetBase,
    pub text: TextAttributes,
    // TODO: usesVariables?
}
