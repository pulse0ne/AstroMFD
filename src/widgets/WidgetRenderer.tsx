import {WidgetPropsBase} from "./WidgetPropsBase.ts";
import {Button} from "./Button.tsx";
import {Widget} from "../types/widget.ts";
import {Label} from "./Label.tsx";
import {Panel} from "./Panel.tsx";

// type WidgetType = "button" | "label" | "panel";

// type WidgetRendererProps<W extends WidgetPropsBase> = {
//   widget: WidgetType;
// } & ComponentPropsWithoutRef<FC<W>>;
//
// function WidgetRenderer<W extends WidgetPropsBase>({ widget, ...restProps }: WidgetRendererProps<W>) {
//   const Component: FC<W & WidgetPropsBase> = useMemo(() => {
//     if (widget === "button") return Button;
//     else return Button;
//   }, [widget]);
//   if (Component === null) return null;
//   return <Component {...restProps} />;
// }

// type ComponentProps = { type: WidgetType } & (ButtonProps | LabelProps); // TODO: panel

// const componentMap: Record<WidgetType, FC<Omit<ComponentProps, "type">>> = {
//   button: Button as FC<Omit<ComponentProps, "type">>,
//   label: Label as FC<Omit<ComponentProps, "type">>,
//   panel: Button as FC<Omit<ComponentProps, "type">>  // TODO: panel type
// };
//
// // export function WidgetRenderer({ type, ...rest }: ComponentProps) {
// //   const Component = componentMap[type];
// //   return <Component {...rest} />;
// // }

export type WidgetRendererProps = WidgetPropsBase & {
  widget: Widget;
  state: "primary" | "pressed";
};

export function WidgetRenderer({ widget, onSelect, onUpdate, isSelected, state }: WidgetRendererProps) {
  if (widget.type === "button") {
    return <Button onSelect={onSelect} onUpdate={onUpdate} attr={widget} isSelected={isSelected} state={state} />;
  } else if (widget.type === "label") {
    return <Label onSelect={onSelect} onUpdate={onUpdate} attr={widget} isSelected={isSelected} />;
  } else if (widget.type === "panel") {
    return <Panel onSelect={onSelect} onUpdate={onUpdate} attr={widget} isSelected={isSelected} />;
  } else {
    return null;
  }
}


///////

// const TEST: ButtonAttributes = {
//   id: "1",
//   type: "button",
//   buttonType: "action",
//   navTarget: null,
//   shape: {
//     size: { width: 200, height: 100 },
//     position: { x: 200, y: 200 },
//     fill: "rgb(56, 30, 83)",
//     stroke: "rgb(130, 51, 152)",
//     strokeWidth: 1,
//     cornerRadius: 8
//   },
//   text: {
//     text: "Button",
//     font: null,
//     fontSize: 16,
//     fontColor: "white",
//     horizontalAlignment: "center",
//     verticalAlignment: "middle"
//   },
//   pressed: {
//     shape: {},
//     text: {}
//   }

  // width: 200,
  // height: 100,
  // x: 400,
  // y: 400,
  // buttonType: "action",
  // navTarget: null,
  // primary: {
  //   fill: "rgb(56,30,83)",
  //   text: "Hello",
  //   fontSize: 16,
  //   fontColor: "white",
  //   textAlignmentH: "center",
  //   textAlignmentV: "middle",
  //   strokeWidth: 2,
  //   cornerRadius: 8,
  //   icon: null,
  //   font: null,
  //   stroke: "rgb(130,51,152)"
  // },
  // pressed: {
  //   fontSize: 16,
  //   fontColor: "white",
  //   textAlignmentH: "center",
  //   textAlignmentV: "middle",
  //   strokeWidth: 0,
  //   cornerRadius: 0,
  //   icon: null,
  //   text: null,
  //   font: null,
  //   fill: null,
  //   stroke: null
  // }
// };
//
// const widgets: Widget[] = [
//   TEST,
//   Object.assign({}, TEST, { id: "2" })
// ];
//
// function TestComponent() {
//   // const [ selected, setSelected ] = useState<string>("");
//
//   return (
//     <>
//       {widgets.map(widget => <WidgetRenderer key={widget.id} widget={widget} onSelect={} onUpdate={} />)}
//     </>
//   );
// }
