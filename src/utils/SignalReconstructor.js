import LinkedList from './LinkedList';

export default class SignalReconstructor {
  constructor(props = {}) {
    this.queue = new LinkedList();
    this.startDate = 0;
    this.outputInterval = 10; // random acceptable value
    this.outputTimeout = null;
  }

  addSamples(newSamples) {
    for (let i = 0; i < newSamples.length; i++) {
      this.queue.push(newSamples[i]);
    }
  }

  setSampleListener(listener) {
    this.sampleListener = listener;
  }

  setOutputInterval(interval) {
    this.outputInterval = interval;
  }

  start() {
    this.startDate = Date.now();
    this.outputTimeout = () => {
      
    }
  }

  stop() {

  }
};