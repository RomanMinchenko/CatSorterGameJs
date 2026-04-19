import { registerGlobalGameEvents } from "./app/events/registerGlobalGameEvents.js";
import { setEngine } from "./app/getEngine.js";
import { LoadScreen } from "./app/screens/load/LoadScreen.js";
import { MainScreen } from "./app/screens/main/MainScreen.js";
import { CreationEngine } from "./engine/engine.js";

const engine = new CreationEngine();
setEngine(engine);

(async () => {
  await engine.init({
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    resizeTo: window,
    background: "#1E1E1E",
    resizeOptions: { minWidth: 1500, minHeight: 2000, letterbox: false },
  });

  registerGlobalGameEvents();

  await engine.navigation.showScreen(LoadScreen);
  await engine.navigation.showScreen(MainScreen);
})();
