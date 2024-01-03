import EventEmitter from 'events';
import { SerialPort } from 'serialport';
import Parser from './Parser';
import State from './State';
import { StateProps } from './interfaces';

const cobs = require('cobs');

const Pixy2 = (path: string) => {
  const eventEmitter = new EventEmitter();

  let state = State.IDLE;
  let port: SerialPort;
  let parser: Parser;

  function init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (port) {
        setTimeout(reject, 0);
      }

      port = new SerialPort({ path, baudRate: 115200 });
      parser = new Parser();

      port.pipe(parser);

      port.on('error', error => eventEmitter.emit('error', error));
      port.on('disconnect', () => eventEmitter.emit('disconnect'));
      port.on('close', () => eventEmitter.emit('close'));
      port.on('open', onPortOpen);

      parser.on('ready', resolve);
      parser.on('line', data => eventEmitter.emit('line', data));
      parser.on('blocks', data => eventEmitter.emit('blocks', data));
      parser.on('stateChange', data => eventEmitter.emit('stateChange', data));
    });
  }

  function setState(newState: string, args: StateProps = {}): Promise<void> {
    const pan = numberToHex(args.pan || 127);
    const tilt = numberToHex(args.tilt || 0);
    const led = numberToHex(args.led || 0);

    return new Promise((resolve) => {
      switch (newState) {
        case State.IDLE:
          writeToSerialPort([0xA6, 0x10, pan, tilt, led]);
          break;

        case State.LINE:
          writeToSerialPort([0xA6, 0x15, pan, tilt, led]);
          break;

        case State.BLOCKS:
          writeToSerialPort([0xA6, 0x20, pan, tilt, led]);
          break;
      }

      state = newState;

      resolve();
    });
  }

  function writeToSerialPort(buffer: number[]) {
    port.write(cobs.encode(Buffer.from(buffer), true));
  }

  function numberToHex(value: number) {
    return Number(`0x${('00' + value.toString(16)).substr(-2).toUpperCase()}`);
  }

  function onPortOpen() {
    port.flush(error => {
      if (error) {
        eventEmitter.emit('error', error);
      }

      state = State.IDLE;
    });
  }

  return Object.freeze({
    init,
    setState,
    on: eventEmitter.on.bind(eventEmitter),
    off: eventEmitter.off.bind(eventEmitter),
  });
};

module.exports = Pixy2;
