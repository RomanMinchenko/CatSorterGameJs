import { FancyButton } from "@pixi/ui";
import { animate } from "motion";

export class Button extends FancyButton {
  constructor() {
    super({
      defaultView: "button.png",
      anchor: 0.5,
    });

    this.on("pointerdown", () => this._onButtonPointerDown());
  }

  _onButtonPointerDown() {
    animate(this, { scale: [1, 0.9, 1] }, { duration: 0.2, ease: "backOut" });
  }
}
