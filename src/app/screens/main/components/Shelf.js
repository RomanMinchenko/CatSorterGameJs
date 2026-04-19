import { Sprite, Texture } from "pixi.js";
import { getShelfFrameNameByColor } from "../../../utils/getFrameNameByColor.js";

export default class Shelf extends Sprite {
  isEmpty = true;
  _color = "";

  constructor(color) {
    const frameName = getShelfFrameNameByColor(color);
    super({
      texture: Texture.from(frameName),
      anchor: 0.5,
      scale: 1.4,
    });

    this._color = color;
  }

  getColor() {
    return this._color;
  }
}
