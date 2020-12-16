import RNFetchBlob from 'rn-fetch-blob';
import MovuinoDevice from './MovuinoDevice';
import PolarDevice from './PolarDevice';
import { getStringDate } from './date-utils';

class Devices {
  constructor() {
    this.devices = new Map();
    this.recordingStreams = [];
  }

  async add(scanResult) {
    const { id, name, meta } = scanResult;

    if (this.devices.has(id)) return;

    switch (meta.type) {
      case 'polar':
        console.log('connecting polar device ' + name)
        try {
          const device = new PolarDevice({ id, name, meta });
          this.devices.set(id, device);
          await device.connect();
          console.log('polar device ' + name + ' connected');
        } catch (e) {
          console.log('couldn\'t connect device ' + name);
          console.log(e);
          this.devices.delete(id);
        }
        break;
      case 'movuino':
        console.log('connecting movuino device ' + name);
        try {
          const device = new MovuinoDevice({ id, name, meta });
          this.devices.set(id, device);
          await device.connect();
          console.log('movuino device ' + name + ' connected');
        } catch (e) {
          console.log('couldn\'t connect device ' + name);
          console.log(e);
          this.devices.delete(id);
        }
        break;
      default: // never happens
        break;
    }
  }

  async remove(id) {
    if (!this.devices.has(id)) return;

    const device = this.devices.get(id);
    const { name, meta } = device.scanResult;
    switch (meta.type) {
      case 'polar':
        console.log('disconnecting polar device ' + name);
        try {
          await device.disconnect();
          this.devices.delete(id);
          console.log('polar device ' + name + ' disconnected');
        } catch (e) {
          console.log('couldn\'t disconnect device ' + name);
          console.log(e);
        }
        break;
      case 'movuino':
        console.log('disconnecting movuino device ' + name);
        try {
          await device.disconnect();
          this.devices.delete(id);
          console.log('movuino device ' + name + ' disconnected');
        } catch (e) {
          console.log('couldn\'t disconnect device ' + name);
          console.log(e);
        }
        break;
      default: // never happens
        break;
    }
  }

  hasActiveStreams() {
    return this.getActiveStreams().length > 0;
  }

  getActiveStreams() {
    const streams = [];

    this.devices.forEach((d, id) => {
      Object.keys(d.streams).forEach(s => {
        if (d.streams[s].streaming) {
          streams.push({ id, stream: s });
        }
      });
    });

    return streams;
  }

  startRecording() {
    // for android api 29+, see :
    // https://stackoverflow.com/questions/63392170/write-files-to-the-android-external-storage-using-react-native-fs

    this.recordingStreams = [];
    const activeStreams = this.getActiveStreams();
    if (activeStreams.length === 0) return;

    const folder = `${RNFetchBlob.fs.dirs.DownloadDir}/${getStringDate()}`;

    RNFetchBlob.fs.mkdir(folder)
    .then(() => {
      const promises = [];

      activeStreams.forEach(s => {
        const { type, model, id } = this.devices.get(s.id).scanResult.meta;
        const filename = `${type}-${model}-${id}-${s.stream}.csv`;

        promises.push(new Promise((resolve, reject) => {
          RNFetchBlob.fs.writeStream(`${folder}/${filename}`, 'utf8')
          .then(stream => {
            resolve({ ...s, filestream: stream });
          });
        })
        );
      });

      return Promise.all(promises);
    })
    .then(streams => { // actually of the form { id, stream, filestream }
      const now = Date.now();
      streams.forEach(s => {
        const stream = this.devices.get(s.id).streams[s.stream];
        this.recordingStreams.push(stream);
        stream.startRecording(now, s.filestream);
      });
    });
  }

  stopRecording() {
    this.recordingStreams.forEach(stream => {
      stream.stopRecording();
    });
  }
};

export default new Devices();
