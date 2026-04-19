import { Container } from "pixi.js";
import { GAME_CONFIG } from "../../../core/GameConfig.js";
import Shelf from "./Shelf.js";
import Cat from "./Cat.js";
import EventManager from "../../../../engine/utils/EventManager.js";
import { GAME_EVENTS } from "../../../events/GameEvents.js";
import { CAT_STATES } from "../../../core/enum.js";

export default class GameField extends Container {
  _cats = {};
  _shelves = [];

  constructor() {
    super();

    this._init();
  }

  disableInput() {
    this.interactiveChildren = false;
  }

  enableInput() {
    this.interactiveChildren = true;
  }

  _init() {
    this._initShelves();
    this._initCats();

    this._listenSignals();
  }

  _initShelves() {
    const { order, spacing } = GAME_CONFIG.gameField.shelves;

    for (let rowIndex = 0; rowIndex < order.length; rowIndex++) {
      if (!this._shelves[rowIndex]) {
        this._shelves[rowIndex] = [];
      }

      for (let shelfIndex = 0; shelfIndex < order[rowIndex].length; shelfIndex++) {
        const shelfFrame = order[rowIndex][shelfIndex];
        const shelf = new Shelf(shelfFrame);
        const { width, height } = shelf.getBounds();
        const x = shelf.width / 2 + shelfIndex * (width + spacing);
        const y = shelf.height / 2 + rowIndex * (height + spacing);
        shelf.position.set(x, y);
        this.addChild(shelf);

        this._shelves[rowIndex][shelfIndex] = shelf;
      }
    }
  }

  _initCats() {
    const { order } = GAME_CONFIG.gameField.cats;

    for (let rowIndex = 0; rowIndex < order.length; rowIndex++) {
      for (let catIndex = 0; catIndex < order[rowIndex].length; catIndex++) {
        const catColor = order[rowIndex][catIndex];
        const cat = new Cat(catColor);
        this.addChild(cat);

        const shelf = this._shelves[rowIndex][catIndex];
        if (shelf) {
          cat.setToShelf(shelf, false);
        }

        if (!this._cats[catColor]) {
          this._cats[catColor] = [];
        }

        this._cats[catColor].push(cat);
      }
    }
  }

  _listenSignals() {
    const eventManager = EventManager.getInstance();

    eventManager.on(GAME_EVENTS.CAT_CLICKED, ({ cat }) => {
      this._onCatClicked(cat);
    });
  }

  async _onCatClicked(cat) {
    const freeShelve = this._findFreeShelveForCat();

    if (freeShelve) {
      this.disableInput();
      await cat.setToShelf(freeShelve);
      this._updateFilledShelvesWithCats();
    }

    this.enableInput();
    const isAllCatsAsleep = this._isAllCatsAsleep();
    if (isAllCatsAsleep) {
      EventManager.getInstance().emit(GAME_EVENTS.ALL_CATS_ASLEEP);
    }
  }

  _findFreeShelveForCat() {
    for (const shelfRow of this._shelves) {
      for (const shelf of shelfRow) {
        if (shelf.isEmpty) {
          return shelf;
        }
      }
    }

    return null;
  }

  _updateFilledShelvesWithCats() {
    for (const key in this._cats) {
      const cats = this._cats[key];

      const isAllCatsPlacedCorrectly = cats.every(cat => {
        const shelf = cat.getShelf();
        return shelf && shelf.getColor() === cat.getColor();
      });

      if (isAllCatsPlacedCorrectly) {
        for (let i = 0; i < cats.length; i++) {
          const cat = cats[i];
          cat.setState(CAT_STATES.SLEEP);
        }
      }
    }
  }

  _isAllCatsAsleep() {
    for (const key in this._cats) {
      const cats = this._cats[key];
      const isAllCatsAsleep = cats.every(cat => cat.getState() === CAT_STATES.SLEEP);

      if (!isAllCatsAsleep) {
        return false;
      }
    }

    return true;
  }
}