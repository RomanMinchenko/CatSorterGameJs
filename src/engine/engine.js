import { Application, Assets, extensions, ResizePlugin } from "pixi.js";
import { CreationResizePlugin } from "./resize/ResizePlugin.js";
import { CreationNavigationPlugin } from "./navigation/NavigationPlugin.js";
import { getResolution } from "./utils/getResolution.js";

import manifest from "../manifest.json";

extensions.remove(ResizePlugin);
extensions.add(CreationResizePlugin);
extensions.add(CreationNavigationPlugin);

export class CreationEngine extends Application {
  async init(opts) {
    opts.resizeTo ??= window;
    opts.resolution ??= getResolution();

    await super.init(opts);

    document.getElementById("pixi-container").appendChild(this.canvas);
    document.addEventListener("visibilitychange", this.visibilityChange);

    await Assets.init({ manifest, basePath: "assets" });
    await Assets.loadBundle("preload");

    const allBundles = manifest.bundles.map((item) => item.name);
    Assets.backgroundLoadBundle(allBundles);
  }

  destroy(
    rendererDestroyOptions = false,
    options = false,
  ) {
    document.removeEventListener("visibilitychange", this.visibilityChange);
    super.destroy(rendererDestroyOptions, options);
  }

  visibilityChange = () => {
    if (document.hidden) {
      this.navigation.blur();
    } else {
      this.navigation.focus();
    }
  };
}
