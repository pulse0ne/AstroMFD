declare module "xml-reader" {

  export type XmlNode = {
    name: string;
    type: "element"|"text";
    value: string;
    parent: XmlNode|null;
    attributes: Record<string, string>;
    children: XmlNode[];
  };

  export function parseSync(input: string, options: Record<string, any>): XmlNode;
}
