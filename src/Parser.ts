import { Transform } from 'stream';
import parseLine from './utils/parseLine';
import parseBlocks from './utils/parseBlocks';
import parseStateChange from './utils/parseStateChange';
import { BlocksData, LineData, StateChangeData } from './types';

const cobs = require('cobs');
const numDescriptorBytes = 4;

class Parser extends Transform {
  startFlags: Buffer;
  buffer: Buffer;

  constructor() {
    super();

    this.startFlags = Buffer.from([0xA6, 0x6A]);
    this.buffer = Buffer.alloc(0);
  }

  _transform(chunk: Buffer, encoding: string, callback: Function) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    for (let j = 0; j < this.buffer.length; j++) {
      if (this.buffer.indexOf(this.startFlags, 0, 'hex') !== -1) {
        const packetStart = this.buffer.indexOf(this.startFlags, 0, 'hex') - 1;

        if (this.buffer.length > packetStart + numDescriptorBytes) {
          const command = this.buffer[packetStart + 3];
          const dataLength = this.buffer[packetStart + 4];

          if (this.buffer.length >= packetStart + numDescriptorBytes + dataLength + 1) {
            const packetEnd = packetStart + numDescriptorBytes + dataLength + 1;
            const packet = this.buffer.slice(packetStart, packetEnd);
            const decodedPacket: Buffer = cobs.decode(packet);
            const packetData: number[] = [];

            this.buffer = this.buffer.slice(packetEnd);
            j = 0;

            for (let i = 0; i < dataLength; i++) {
              const index = numDescriptorBytes + i;
              packetData.push(decodedPacket[index]);
            }

            switch(command) {
              case 0xFF:
                this.emit('ready');
                break;

              case 0x15:
                this.emit('line', parseLine(packetData as LineData));
                break;

              case 0x20:
                this.emit('blocks', parseBlocks(packetData as BlocksData));
                break;

              case 0x25:
                this.emit('stateChange', parseStateChange(packetData as StateChangeData));
                break;
            }
          }
        }
      }
    }

    callback();
  }
}

export default Parser;
