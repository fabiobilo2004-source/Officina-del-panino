import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { startSiteEdits } from "./lib/site-edits";

startSiteEdits();

createRoot(document.getElementById("root")!).render(<App />);
