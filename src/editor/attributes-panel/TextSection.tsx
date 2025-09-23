import {TextAttributes} from "../../types/widget.ts";
import {FontSpec} from "../../types/fonts.ts";

export type TextSectionProps = {
  textAttr: TextAttributes;
  onUpdate: (attr: TextAttributes) => void;
  fonts: FontSpec[];
};

export function TextSection({}: TextSectionProps) {
  return (
    <div className="attribute-section col gap-16" style={{paddingTop: 16}}>
      <h5>TEXT</h5>
    </div>
  );
}