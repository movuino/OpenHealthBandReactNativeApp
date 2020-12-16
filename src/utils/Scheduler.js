class Scheduler {
  constructor() {
    this.params = {
      lookAhead: 1000,
    };

    this.buffer = {

    }
  }

  start() {
    this.startDate = Date.now();
    this.running = true;
  }
};

export default new Scheduler();