class Device {
  constructor(scanResult, streams = {}) {
    this.scanResult = scanResult;
    this.state = {
      added: false,
      connectionState: 'disconnected',
    };
    this.streams = streams;
    this.listeners = {};
  }

  /**
    * the following methods must be implemented in child classes
    * (PolarDevice and MovuinoDevice)
    */
    
  // async connect() { return Promise.resolve(); }
  // async disconnect() { return Promise.resolve(); }
  // startRecording() {}
  // stopRecording() {}

  addListener(event, listener) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(listener);
  }

  removeListener(event, listener) {
    if (typeof event === 'string' && this.listeners[event]) {
      const index = this.listeners[event].indexOf(listener);
      if (index !== -1) {
        console.log('removed listener ' + event);
        this.listeners[event].splice(index, 1);
        if (this.listeners[event].length === 0) {
          this.listeners[event] = null;
        }
      }
    }
  }

  removeListeners(event = null) {
    if (event === null) {
      this.listeners = {};
    } else if (typeof event === 'string' && this.listeners[event]) {
      this.listeners[event] = null;
      delete this.listeners[event];
    }
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((l) => { l(data); });
  }

  setState(data) {
    const prevState = JSON.parse(JSON.stringify(this.state));
    Object.assign(this.state, data);
    const res = { prevState, newState: this.state };
    this.emit('state', res);
    return res;
  }
};

export default Device;