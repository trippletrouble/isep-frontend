import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { I18nProvider, activateLocale, DEFAULT_LOCALE, type Locale } from "./i18n";

const savedLocale = (localStorage.getItem("locale") as Locale) ?? DEFAULT_LOCALE;

async function bootstrap() {
  await activateLocale(savedLocale);

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <I18nProvider>
        <App />
      </I18nProvider>
    </StrictMode>,
  );
}

bootstrap();
