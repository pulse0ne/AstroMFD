export type Matrix = [number, number, number, number, number, number];
export const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

export function multiply(m1: Matrix, m2: Matrix): Matrix {
  const [a1,b1,c1,d1,e1,f1] = m1;
  const [a2,b2,c2,d2,e2,f2] = m2;
  return [
    a1*a2 + c1*b2,
    b1*a2 + d1*b2,
    a1*c2 + c1*d2,
    b1*c2 + d1*d2,
    a1*e2 + c1*f2 + e1,
    b1*e2 + d1*f2 + f1
  ];
}

export function parseTransform(attr?: string): Matrix {
  if (!attr) return IDENTITY;
  let m: Matrix = IDENTITY.slice() as Matrix;

  const commands = attr.match(/[a-z]+\([^)]*\)/gi);
  if (!commands) return m;

  for (const cmd of commands) {
    const [type, argsRaw] = cmd.split("(");
    const args = argsRaw.replace(")","").split(/[ ,]+/).map(Number);

    switch(type.trim()) {
      case "matrix": if(args.length===6) m = multiply(m,args as Matrix); break;
      case "translate": { const [tx,ty=0]=args; m = multiply(m,[1,0,0,1,tx,ty]); } break;
      case "scale": { const [sx,sy=sx]=args; m = multiply(m,[sx,0,0,sy,0,0]); } break;
      case "rotate": { const [angle,cx=0,cy=0]=args; const rad=angle*Math.PI/180; const cos=Math.cos(rad); const sin=Math.sin(rad);
        if(cx||cy){ m=multiply(m,[1,0,0,1,cx,cy]); m=multiply(m,[cos,sin,-sin,cos,0,0]); m=multiply(m,[1,0,0,1,-cx,-cy]); }
        else m=multiply(m,[cos,sin,-sin,cos,0,0]); } break;
      case "skewX": { const angle = args[0]*Math.PI/180; m=multiply(m,[1,0,Math.tan(angle),1,0,0]); } break;
      case "skewY": { const angle = args[0]*Math.PI/180; m=multiply(m,[1,Math.tan(angle),0,1,0,0]); } break;
    }
  }
  return m;
}

export function applyMatrix([x,y]: [number,number], m: Matrix): [number,number] {
  return [x*m[0]+y*m[2]+m[4], x*m[1]+y*m[3]+m[5]];
}
