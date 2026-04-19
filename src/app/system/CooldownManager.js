export default class CooldownManager {
  _tasks = new Set();

  add(seconds, callback) {
    this._tasks.add({
      duration: seconds,
      remaining: seconds,
      callback: callback
    });
  }

  update(deltaMS) {
    const deltaSec = deltaMS / 1000;

    for (let task of this._tasks) {
      task.remaining -= deltaSec;

      if (task.remaining <= 0) {
        task.callback();
        task.remaining = task.duration;
      }
    }
  }
}
