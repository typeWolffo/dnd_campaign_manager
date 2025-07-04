import { exposeThemeContext } from "./theme/theme-context";
import { exposeWindowContext } from "./window/window-context";
import { exposeElectronAPIContext } from "./electron-api/electron-api-context";

export default function exposeContexts() {
  exposeWindowContext();
  exposeThemeContext();
  exposeElectronAPIContext();
}
