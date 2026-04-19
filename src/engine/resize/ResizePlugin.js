import { ExtensionType } from "pixi.js";
import { resize } from "./resize.js";

export class CreationResizePlugin {
  static extension = ExtensionType.Application;

  static _resizeId = null;
  static _resizeTo = null;
  static _cancelResize = null;

  static init(options) {
    const app = this;

    Object.defineProperty(
      app,
      "resizeTo",
      {
        set(dom) {
          globalThis.removeEventListener("resize", app.queueResize);
          this._resizeTo = dom;
          if (dom) {
            globalThis.addEventListener("resize", app.queueResize);
            app.resize();
          }
        },
        get() {
          return this._resizeTo;
        },
      },
    );

    app.queueResize = () => {
      if (!this._resizeId) {
        return;
      }

      this._cancelResize();

      this._resizeId = requestAnimationFrame(() => {
        app.resize();
      });
    };

    app.resize = () => {
      if (!this._resizeTo) {
        return;
      }

      this._cancelResize();

      let canvasWidth;
      let canvasHeight;

      if (this._resizeTo === globalThis.window) {
        canvasWidth = globalThis.innerWidth;
        canvasHeight = globalThis.innerHeight;
      } else {
        const { clientWidth, clientHeight } = this._resizeTo;
        canvasWidth = clientWidth;
        canvasHeight = clientHeight;
      }

      const { width, height } = resize(
        canvasWidth,
        canvasHeight,
        app.resizeOptions.width,
        app.resizeOptions.height,
        app.resizeOptions.letterbox,
      );

      app.renderer.canvas.style.width = `${canvasWidth}px`;
      app.renderer.canvas.style.height = `${canvasHeight}px`;

      window.scrollTo(0, 0);

      app.renderer.resize(width, height);
    };

    this._cancelResize = () => {
      if (this._resizeId) {
        cancelAnimationFrame(this._resizeId);
        this._resizeId = null;
      }
    };
    this._resizeId = null;
    this._resizeTo = null;
    app.resizeOptions = {
      minWidth: 768,
      minHeight: 1024,
      letterbox: true,
      ...options.resizeOptions,
    };
    app.resizeTo = options.resizeTo || null;
  }

  static destroy() {
    const app = this;

    globalThis.removeEventListener("resize", app.queueResize);
    this._cancelResize();
    this._cancelResize = null;
    app.queueResize = null;
    app.resizeTo = null;
    app.resize = null;
  }
}
