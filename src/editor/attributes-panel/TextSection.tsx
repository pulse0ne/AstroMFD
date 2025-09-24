import {TextAttributes} from "../../types/widget.ts";
import {FontSpec} from "../../types/fonts.ts";
import {useEffect, useMemo} from "react";

export type TextSectionProps = {
  textAttr: TextAttributes;
  onUpdate: (attr: TextAttributes) => void;
  fonts: FontSpec[];
};

export function TextSection({ textAttr, fonts, onUpdate }: TextSectionProps) {

  const fontMap = useMemo(() => {
    return fonts.reduce((acc, font) => {
      acc[font.postscriptName] = font;
      return acc;
    }, {} as Record<string, FontSpec>);
  }, [fonts]);

  const handleStringValueChange = (key: "text"|"font"|"fontColor", value: string) => {
    console.log(key, value);
    onUpdate(Object.assign({}, textAttr, { [key]: value }));
  };

  const handleFontValueChange = (value: string) => {
    const fontSpec = fontMap[value];
    if (fontSpec) {
      onUpdate(Object.assign({}, textAttr, { font: fontSpec }));
    }
  };

  useEffect(() => {
    console.log(textAttr);
  }, [textAttr]);

  return (
    <div className="attribute-section col gap-16" style={{paddingTop: 16}}>
      <h5>TEXT</h5>
      <div className="row align-center gap-16">
        <span>Label:</span>
        <textarea
          className="text-textarea"
          value={textAttr.text ?? ""}
          onChange={(evt) => handleStringValueChange("text", evt.target.value)}
        />
      </div>
      <div className="row align-center gap-16">
        <span>Font:</span>
        <select
          id="font-select"
          value={textAttr.font?.postscriptName ?? ""}
          onChange={(evt) => handleFontValueChange(evt.target.value)}
        >
          <option value=""></option>
          {fonts.map(font => (
            <option
              key={font.postscriptName}
              value={font.postscriptName}
              style={{ fontFamily: font.name }}
            >
              {font.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}