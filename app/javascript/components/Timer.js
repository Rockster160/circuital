// // Example usage:
// const timer = new Timer();

// const think = function () {
//   timer.start("beginning");
//   // Simulating expensive code
//   for (let i = 0; i < 1e6; i++);
//   timer.start("middle");
//   for (let i = 0; i < 1e6; i++);
//   timer.start("end");
//   for (let i = 0; i < 1e6; i++);
//   timer.end();
// };
// for (let index = 0; index < 10; index++) {
//   think();
// }
// timer.log() // Outputs the results

export default class Timer {
  constructor() {
    this.timers = {};
    this.currentStart = null;
    this.currentLabel = null;
  }

  start(label) {
    const now = performance.now();

    if (this.currentStart !== null && this.currentLabel !== null) {
      this._endTimer(now);
    }

    this.currentStart = now;
    this.currentLabel = label;
  }

  end() {
    if (this.currentStart !== null && this.currentLabel !== null) {
      this._endTimer(performance.now());
      this.currentStart = null;
      this.currentLabel = null;
    }
  }

  _endTimer(endTime) {
    const elapsed = endTime - this.currentStart;

    if (!this.timers[this.currentLabel]) {
      this.timers[this.currentLabel] = { count: 0, total: 0 };
    }

    this.timers[this.currentLabel].count++;
    this.timers[this.currentLabel].total += elapsed;
  }

  log() {
    const table = Object.entries(this.timers).reduce((acc, [label, { count, total }]) => {
      acc[label] = { count, total, avg: total / count }
      return acc
    }, {});

    console.table(table);
  }
}
