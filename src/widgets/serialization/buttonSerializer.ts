import {ButtonAttributes} from "../../types/widget.ts";

export function buttonSerializer(input: ButtonAttributes): ButtonAttributes {
  const copy = JSON.parse(JSON.stringify(input)) as ButtonAttributes;
  // TODO

  // for (const key in copy.primary) {
  //   const k = key as keyof Attributes;
  //   const v = copy.pressed[k];
  //   if (v === null || v === undefined) {
  //     // @ts-ignore
  //     copy.pressed[k] = copy.primary[k];
  //   }
  // }
  return copy;
}