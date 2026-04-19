export default class EventManager {
  static exists = false;
  static instance = false;

  _listeners = new Map();

  constructor() {
    if (EventManager.exists) {
      return EventManager.instance;
    }

    EventManager.exists = true;
    EventManager.instance = this;
  }

  static getInstance() {
    if (EventManager.exists) {
      return EventManager.instance;
    }

    return new EventManager();
  }

  on(eventName, listener) {
    if (!this._listeners.has(eventName)) {
      this._listeners.set(eventName, new Set());
    }

    this._listeners.get(eventName).add(listener);
  }

  off(eventName, listener) {
    if (this._listeners.has(eventName)) {
      if (listener) {
        this._listeners.get(eventName).delete(listener);
      } else {
        this._listeners.get(eventName).clear();
      }
    }
  }

  once(eventName, listener) {
    this.on(eventName, (data) => {
      listener(data);
      this.off(eventName, listener);
    });
  }

  emit(eventName, data) {
    if (this._listeners.has(eventName)) {
      const listeners = this._listeners.get(eventName);
      for (const listener of listeners) {
        listener(data);
      }
    }
  }
}
