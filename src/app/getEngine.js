let instance = null;

export function engine() {
  return instance;
}

export function setEngine(app) {
  instance = app;
}
