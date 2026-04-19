import { animate } from "motion";
import { Container } from "pixi.js";
import { Label } from "../../ui/Label.js";

export class LoadScreen extends Container {
  static assetBundles = ["gameplay", "ui", "bg", "cta"];

  _text = null;

  constructor() {
    super();
  }

  resize(width, height) {
    this._text.position.set(width * 0.5, height * 0.5);
  }

  async show() {
    this.alpha = 1;
  }

  async hide() {
    await animate(
      this,
      { alpha: 0 },
      {
        duration: 0.3,
        ease: "linear",
        delay: 1,
      },
    );
  }

  prepare() {
    this.initText();
  }

  initText() {
    const text = (this._text = new Label({
      text: "Loading...",
      style: {
        fill: 0x4a4a4a,
        fontSize: 36,
      },
    }));
    text.anchor.set(0.5);
    this.addChild(text);
  }
}
