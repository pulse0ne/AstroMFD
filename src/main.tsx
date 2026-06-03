import ReactDOM from "react-dom/client";

import App from "./App";
import { loadBundledFonts } from "./utils/bundledFonts.ts";

import "./index.css";

window.onerror = (msg, src, line, col, err) => {
  document.body.innerText = `Error: ${msg}\n${src}:${line}:${col}\n${err?.stack ?? ""}`;
};
window.onunhandledrejection = (e) => {
  document.body.innerText = `Unhandled rejection: ${e.reason}`;
};

loadBundledFonts();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />,
);
