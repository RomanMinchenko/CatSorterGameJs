import { animate } from "motion";
import {
  BlurFilter,
  Container,
  NineSliceSprite,
  Sprite,
  Texture,
} from "pixi.js";

import { engine } from "../getEngine.js";
import CooldownManager from "../system/CooldownManager.js";
import { GAME_EVENTS } from "../events/GameEvents.js";
import EventManager from "../../engine/utils/EventManager.js";

export class EndGamePopup extends Container {
  _likeIcon = null;
  _bg = null;
  _cooldownManager = null;

  constructor() {
    super();
  }

  update(time) {
    this._cooldownManager.update(time.deltaMS);
  }

  resize(width, height) {
    const centerX = width / 2;
    const centerY = height / 2;

    this._likeIcon.x = centerX;
    this._likeIcon.y = centerY;

    this._bg.x = centerX;
    this._bg.y = centerY;
    this._bg.width = width;
    this._bg.height = height;
  }

  async show() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [
        new BlurFilter({ strength: 5 }),
      ];
    }

    this._bg.alpha = 0;
    await animate(this._bg, { alpha: 1 }, { duration: 0.2, ease: "linear" });

    const iconInitialY = this._likeIcon.y;
    this._likeIcon.y = -this._likeIcon.height * 0.5;
    this._likeIcon.visible = true;
    await animate(
      this._likeIcon,
      { y: iconInitialY },
      {
        duration: 0.5,
        ease: "backOut",
      },
    );
  }

  prepare() {
    this._initBg();
    this._initLikeIcon();
    this._initCooldownManager();

    this._listenSignals();
  }

  _initBg() {
    this._bg = new NineSliceSprite({
      texture: Texture.from("overlay.png"),
      anchor: 0.5,
      leftWidth: 16,
      topHeight: 16,
      rightWidth: 16,
      bottomHeight: 16,
    });
    this._bg.interactive = true;
    this.addChild(this._bg);
  }

  _initLikeIcon() {
    this._likeIcon = new Sprite({
      texture: Texture.from("like.png"),
      anchor: 0.5,
    });
    this._likeIcon.interactive = true;
    this._likeIcon.visible = false;
    this.addChild(this._likeIcon);
  }

  _initCooldownManager() {
    this._cooldownManager = new CooldownManager();
    this._cooldownManager.add(2, () => {
      this._animateIdleLikeIcon();
    });
  }

  _animateIdleLikeIcon() {
    const likeIconInitialY = this._likeIcon.y;
    animate(
      this._likeIcon,
      {
        rotation: [0, -0.15, 0.15, 0],
        y: [likeIconInitialY, likeIconInitialY - 50, likeIconInitialY],
      },
      {
        duration: 0.5,
        ease: "easeIn",
      },
    );
  }

  _listenSignals() {
    const { _bg, _likeIcon } = this;

    [_bg, _likeIcon].forEach((element) => {
      element.on("pointerdown", () => {
        this._onWinScreenClick();
      });
    });
  }

  _onWinScreenClick() {
    EventManager.getInstance().emit(GAME_EVENTS.CTA_BUTTON_PRESSED);
  }
}
