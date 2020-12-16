import LinkedList from './LinkedList';
import { descriptions } from './streams';

const defaultStreamConfig = {
  bufferDuration: 5000,
  bufferOverhead: 1000,
};

const defaultStreamState = {
  ready: false,
  // reflect the switch state :
  enabled: false,
  // true if enabled and first packet has been received
  streaming: false,
  displaying: false,
  delta: 0,
  localStartDate: 0,
  startDate: 0,
  lastDate: 0,
};

export default class Stream {
  constructor(description) {
    this.label = description.label;
    this.sample = description.sample;
    this.dimension = Object.keys(this.sample).length;
    this.buffer = new LinkedList();

    this.state = Object.assign({}, defaultStreamState);;
    this.recordStream = null;
  }

  setState(data) {
    this.state = Object.assign(this.state, data);
  }

  get ready() { return this.state.ready; }
  get enabled() { return this.state.enabled; }
  get streaming() { return this.state.streaming; }
  get displaying() { return this.state.displaying; }

  set ready(r) { this.setState({ ready: r }); }
  set enabled(e) { this.setState({ enabled: e }); }
  set streaming(s) { this.setState({ streaming: s }); }
  set displaying(d) { this.setState({ displaying: d }); }

  onNewData(data) {
    // console.log(data);
    if (this.state.ready && this.state.enabled) {
      const { timeStamp, samples } = data;

      if (!this.state.streaming) {
        const now = Date.now();
        this.setState({
          streaming: true,
          localStartDate: now,
          startDate: timeStamp,
          lastDate: timeStamp,
          delta: timeStamp - now,
        });  
      }

      if (this.recording && this.recordStream !== null) {
        // COMPUTE TIMESTAMP FOR EACH SAMPLE AND STUFF ...
        const dt = (timeStamp - this.state.lastDate) / samples.length;
        const localTimeStamp = this.state.lastDate - this.state.delta - this.startRecordingDate;
        
        let currentTimeStamp = localTimeStamp;

        samples.forEach(s => {
          currentTimeStamp += dt;
          // we discard samples coming from before start rec
          if (currentTimeStamp >= 0) {
            let line = `${currentTimeStamp}`;

            Object.keys(this.sample).forEach(dim => {
              const d = this.sample[dim];
              switch (d.type) {
                case 'boolean':
                  line += `,${s[dim] ? 1 : 0}`;
                  break;
                case 'float':
                case 'integer':
                  line += `,${s[dim]}`;
                  break;
                default:
                  break;
              }
            });

            this.recordStream.write(`${line}\n`);
          }
        });
      }

      this.setState({ lastDate: timeStamp });
    }
  }

  // for data types, see :
  // https://www.openhumans.org/api/public/datatypes/
  // should be either : 1 (Activity Data)
  // or : 8 (Uncategorized Data)

  startRecording(startDate, filestream) {
    this.startRecordingDate = startDate;
    this.recordStream = filestream;

    let header = `timeStamp(ms:0:+Inf)`;
    Object.keys(this.sample).forEach(dim => {
      const d = this.sample[dim];
      switch (d.type) {
        case 'boolean':
          header += `,${dim}`;
          break;
        case 'integer':
        case 'float':
          header += `,${dim}(${d.unit}:${d.min}:${d.max})`;
          break;
        default:
          break;
      }
    });

    this.recordStream.write(`${header}\n`);
    this.recording = true;
  }

  stopRecording() {
    this.recording = false;
    this.recordStream.close();
    this.recordStream = null;
  }
};