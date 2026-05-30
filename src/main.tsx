import ReactDOM from "react-dom/client";

import App from "./App";
import { loadBundledFonts } from "./utils/bundledFonts.ts";

import "./index.css";

loadBundledFonts();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />,
);
