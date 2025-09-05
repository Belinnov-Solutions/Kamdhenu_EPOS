import React from "react";
import { BrowserRouter } from "react-router-dom";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.js";
import { base_path } from "./environment.jsx";

// TIP: these should be relative to src, not ../src
import "./style/css/feather.css";
import "./style/css/line-awesome.min.css";
import "./style/icons/tabler-icons/webfont/tabler-icons.css";
import "./style/scss/main.scss";
import "./customStyle.scss";
import "./style/icons/fontawesome/css/fontawesome.min.css";
import "./style/icons/fontawesome/css/all.min.css";
import "./style/fonts/feather/css/iconfont.css";

import { createRoot } from "react-dom/client";
import "./i18n";
import { Provider } from "react-redux";
import store from "./core/redux/store.jsx";
import AllRoutes from "./Router/router.jsx";

// ✅ REMOVE this (illegal): import { loadConfig } from "../public/config.js";

/** ---- Runtime config loader (IIS) ---- **/
const loadConfig = async () => {
  // Normalize basename (base_path might be "/" or "/EPOSPORTAL")
  const normalizedBase =
    (base_path || "").endsWith("/")
      ? (base_path || "").slice(0, -1)
      : (base_path || "");

  // Build: https://<host>/<basename>/config.json
  const configUrl = `${window.location.origin}${normalizedBase}/config.json?v=${Date.now()}`;

  // Default/fallback config in case fetch fails
  const defaultConfig = {
    API_BASE_URL: "",
  };

  try {
    const res = await fetch(configUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Expose globally for now; you can wrap with a helper later if you prefer
    window.__APP_CONFIG__ = { ...defaultConfig, ...data };
    // Debug:
    // console.log("Loaded config:", window.__APP_CONFIG__);
  } catch (err) {
    console.error("Failed to load config.json from IIS:", err);
    window.__APP_CONFIG__ = { ...defaultConfig }; // ensure it exists
  }
};
/** ------------------------------------ **/

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);

  (async () => {
    await loadConfig(); // ⏳ wait for IIS config before first render
    root.render(
      <React.StrictMode>
        <Provider store={store}>
          <BrowserRouter basename={base_path}>
            <AllRoutes />
          </BrowserRouter>
        </Provider>
      </React.StrictMode>
    );
  })();
} else {
  console.error("Element with id 'root' not found.");
}
