import { FancyButton } from "@pixi/ui";
import { animate } from "motion";
import { Container, Sprite, Texture, TilingSprite } from "pixi.js";

import CooldownManager from "../../system/CooldownManager.js";
import GameField from "./components/GameField.js";
import EventManager from "../../../engine/utils/EventManager.js";
import { GAME_EVENTS } from "../../events/GameEvents.js";
import { engine } from "../../getEngine.js";
import { EndGamePopup } from "../../popups/EndGamePopup.js";
import { Button } from "../../ui/Button.js";

export class MainScreen extends Container {
  static assetBundles = [];

  _ctaButton = null;
  _bg = null;
  _ctaText = null;
  _gameField = null;
  _cooldownManager = null;

  constructor() {
    super();
  }

  prepare() {
    this._createBg();
    this._createCTAButton();
    this._createCTAText();
    this._createCoolDownManager();
    this._createGameField();
    this._listenGameEvents();
  }

  update(_time) {
    this._cooldownManager.update(_time.deltaMS);
  }

  async pause() {
    this.interactiveChildren = false;
    this._paused = true;
  }

  async resume() {
    this.interactiveChildren = true;
    this._paused = false;
  }

  resize(width, height) {
    const ratio = width / height;
    const isWideScreen = ratio > 1.5;

    const ctaButtonRatioX = isWideScreen ? 0.25 : 0.5;
    const ctaButtonOffsetY = isWideScreen ? 0.6 : 0.9;
    this._ctaButton.x = width * ctaButtonRatioX;
    this._ctaButton.y = height * ctaButtonOffsetY;

    const ctaTextRatioX = isWideScreen ? 0.25 : 0.5;
    const ctaTextRatioY = isWideScreen ? 0.4 : 0.1;
    this._ctaText.x = width * ctaTextRatioX;
    this._ctaText.y = height * ctaTextRatioY;

    const { width: gameFieldWidth, height: gameFieldHeight } = this._gameField.getBounds();
    const gameFieldRatioX = isWideScreen ? 0.65 : 0.5;
    let scale = Math.max(Math.min(1, 0.5 / ratio), 0.8);
    scale = isWideScreen ? 1 : scale;
    this._gameField.scale.set(scale);
    this._gameField.x = width * gameFieldRatioX - gameFieldWidth / 2;
    this._gameField.y = height * 0.5 - gameFieldHeight / 2;

    this._bg.width = width;
    this._bg.height = height;
    this._bg.x = width * 0.5;
    this._bg.y = height * 0.5;
  }

  async show() {
    const elementsToAnimate = [
      this._ctaButton,
      this._bg,
      this._ctaText,
      this._gameField,
    ];

    let finalPromise = null;
    for (const element of elementsToAnimate) {
      element.alpha = 0;
      finalPromise = animate(
        element,
        { alpha: 1 },
        { duration: 0.3, delay: 0.75, ease: "backOut" },
      );
    }

    await finalPromise;
  }

  _createBg() {
    const bg = this._bg = new TilingSprite({
      texture: Texture.from("back.png"),
      anchor: 0.5,
    });
    this.addChild(bg);
  }

  _createCTAButton() {
    this._ctaButton = new Button();
    this._ctaButton.on("pointerdown", () => this.onCtaButtonPress());
    this.addChild(this._ctaButton);
  }

  onCtaButtonPress() {
    EventManager.getInstance().emit(GameEventType.CTA_BUTTON_PRESSED);
  }

  _createCTAText() {
    const ctaText = this._ctaText = new Sprite({
      texture: Texture.from("CTA.png"),
      anchor: 0.5,
      scale: 1,
    });
    this.addChild(ctaText);
  }

  _createCoolDownManager() {
    this._cooldownManager = new CooldownManager();
    this._cooldownManager.add(3, () => this._animateCTA(this._ctaButton));
    this._cooldownManager.add(5, () => this._animateCTA(this._ctaText));
  }

  _createGameField() {
    this._gameField = new GameField();
    this.addChild(this._gameField);
  }

  _animateCTA(item) {
    animate(item,
      { scale: [1, 1.1, 1] },
      {
        duration: 0.5,
        ease: "easeInOut",
        bounce: 0.25,
        repeat: 1,
        repeatType: "reverse"
      },
    );
  }

  _listenGameEvents() {
    EventManager.getInstance().on(GAME_EVENTS.ALL_CATS_ASLEEP, () => {
      engine().navigation.presentPopup(EndGamePopup);
    });
  }
}
