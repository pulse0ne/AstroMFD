use serde::{Deserialize, Serialize};

pub mod base;
pub mod button;
pub mod carousel;
pub mod image;
pub mod label;
pub mod panel;
pub mod slider;
pub mod screen_set;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum Widget {
    Button(button::ButtonAttributes),
    Label(label::LabelAttributes),
    Panel(panel::PanelAttributes),
    Slider(slider::SliderAttributes),
    Carousel(carousel::CarouselAttributes),
    Image(image::ImageAttributes),
}
