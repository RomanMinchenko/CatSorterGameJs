import { Assets, BigPool, Container } from "pixi.js";

export class Navigation {
  app = null;
  container = new Container();
  width = 0;
  height = 0;
  background = null;
  currentScreen = null;
  currentPopup = null;

  init(app) {
    this.app = app;
  }

  setBackground(ctor) {
    this.background = new ctor();
    this._addAndShowScreen(this.background);
  }

  async _addAndShowScreen(screen) {
    if (!this.container.parent) {
      this.app.stage.addChild(this.container);
    }

    this.container.addChild(screen);

    if (screen.prepare) {
      screen.prepare();
    }

    if (screen.resize) {
      screen.resize(this.width, this.height);
    }

    if (screen.update) {
      this.app.ticker.add(screen.update, screen);
    }

    if (screen.show) {
      screen.interactiveChildren = false;
      await screen.show();
      screen.interactiveChildren = true;
    }
  }

  async _hideAndRemoveScreen(screen) {
    screen.interactiveChildren = false;

    if (screen.hide) {
      await screen.hide();
    }

    if (screen.update) {
      this.app.ticker.remove(screen.update, screen);
    }

    if (screen.parent) {
      screen.parent.removeChild(screen);
    }

    if (screen.reset) {
      screen.reset();
    }
  }

  async showScreen(ctor) {
    if (this.currentScreen) {
      this.currentScreen.interactiveChildren = false;
    }

    if (ctor.assetBundles) {
      await Assets.loadBundle(ctor.assetBundles, (progress) => {
        if (this.currentScreen?.onLoad) {
          this.currentScreen.onLoad(progress * 100);
        }
      });
    }

    if (this.currentScreen?.onLoad) {
      this.currentScreen.onLoad(100);
    }

    if (this.currentScreen) {
      await this._hideAndRemoveScreen(this.currentScreen);
    }

    this.currentScreen = BigPool.get(ctor);
    await this._addAndShowScreen(this.currentScreen);
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.currentScreen?.resize?.(width, height);
    this.currentPopup?.resize?.(width, height);
    this.background?.resize?.(width, height);
  }

  async presentPopup(ctor) {
    if (this.currentScreen) {
      this.currentScreen.interactiveChildren = false;
      await this.currentScreen.pause?.();
    }

    if (this.currentPopup) {
      await this._hideAndRemoveScreen(this.currentPopup);
    }

    this.currentPopup = new ctor();
    await this._addAndShowScreen(this.currentPopup);
  }

  async dismissPopup() {
    if (!this.currentPopup) return;
    const popup = this.currentPopup;
    this.currentPopup = null;
    await this._hideAndRemoveScreen(popup);
    if (this.currentScreen) {
      this.currentScreen.interactiveChildren = true;
      this.currentScreen.resume?.();
    }
  }

  blur() {
    this.currentScreen?.blur?.();
    this.currentPopup?.blur?.();
    this.background?.blur?.();
  }

  focus() {
    this.currentScreen?.focus?.();
    this.currentPopup?.focus?.();
    this.background?.focus?.();
  }
}
