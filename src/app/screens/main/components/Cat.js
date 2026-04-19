import { animate } from "motion";
import { Sprite, Texture } from "pixi.js";
import Shelf from "./Shelf.js";
import { GAME_EVENTS } from "../../../events/GameEvents.js";
import EventManager from "../../../../engine/utils/EventManager.js";
import { getCatFrameNameByColor } from "../../../utils/getFrameNameByColor.js";
import { CAT_STATES } from "../../../core/enum.js";

export default class Cat extends Sprite {
  _shelf = null;
  _state = CAT_STATES.IDLE;
  _catColor = "";

  constructor(catColor) {
    const frameName = getCatFrameNameByColor(catColor, CAT_STATES.IDLE);
    super({
      texture: Texture.from(frameName),
      anchor: 0.5,
      pivot: { x: 0, y: 20 },
      scale: 0.7,
    });

    this._catColor = catColor;
    this._initListen();
  }

  getColor() {
    return this._catColor;
  }

  getShelf() {
    return this._shelf;
  }

  setState(newState) {
    this._state = newState;
    const frameNameByState = getCatFrameNameByColor(this._catColor, newState);
    this.texture = Texture.from(frameNameByState);
  }

  getState() {
    return this._state;
  }

  async setToShelf(shelf, animate = true) {
    const { x, y } = shelf;
    if (animate) {
      await this._animateArcMoveTo(x, y);
    } else {
      this.x = x;
      this.y = y;
    }

    this.removeFromShelf();
    this._shelf = shelf;
    shelf.isEmpty = false;
  }

  removeFromShelf() {
    if (this._shelf) {
      this._shelf.isEmpty = true;
      this._shelf = null;
    }
  }

  _animateArcMoveTo(x, y) {
    return new Promise((resolve) => {
      const obj = { t: 0 };
      const startX = this.x;
      const startY = this.y;

      const arcHeight = 300;
      const midX = (startX + x) / 2;
      const midY = Math.min(startY, y) - arcHeight;

      this._changeState(CAT_STATES.SELECT);

      animate(
        obj,
        { t: 1 },
        {
          duration: 0.5,
          ease: "easeInOut",
          onUpdate: () => {
            const t = obj.t;
            const oneMinusT = 1 - t;
            this.x = oneMinusT * oneMinusT * startX + 2 * oneMinusT * t * midX + t * t * x;
            this.y = oneMinusT * oneMinusT * startY + 2 * oneMinusT * t * midY + t * t * y;
          },
          onComplete: () => {
            this._changeState(CAT_STATES.IDLE);
            resolve();
          }
        }
      );
    });
  }

  _changeState(newState) {
    this._state = newState;
    const frameNameByState = getCatFrameNameByColor(this._catColor, newState);
    this.texture = Texture.from(frameNameByState);
  }

  _initListen() {
    this.interactive = true;
    this.on("pointerdown", () => {
      this._onCatClicked();
    });
  }

  _onCatClicked() {
    if (this._state === CAT_STATES.IDLE) {
      EventManager.getInstance().emit(GAME_EVENTS.CAT_CLICKED, { cat: this });
    }
  }
}