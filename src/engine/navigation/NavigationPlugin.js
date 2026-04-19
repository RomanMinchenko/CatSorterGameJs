import { ExtensionType } from "pixi.js";
import { Navigation } from "./navigation.js";

export class CreationNavigationPlugin {
  static extension = ExtensionType.Application;

  static _onResize = null;

  static init() {
    const app = this;

    app.navigation = new Navigation();
    app.navigation.init(app);
    this._onResize = () =>
      app.navigation.resize(app.renderer.width, app.renderer.height);
    app.renderer.on("resize", this._onResize);
    app.resize();
  }

  static destroy() {
    const app = this;
    app.navigation = null;
  }
}
