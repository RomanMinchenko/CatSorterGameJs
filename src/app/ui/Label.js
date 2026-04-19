import { Text } from "pixi.js";

const defaultLabelStyle = {
  align: "center",
};

export class Label extends Text {
  constructor(opts = {}) {
    const style = { ...defaultLabelStyle, ...opts?.style };
    super({ ...opts, style });
    this.anchor.set(0.5);
  }
}
