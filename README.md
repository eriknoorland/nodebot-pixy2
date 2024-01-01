# nodebot-pixy2-serial-json
A Node module to communicate with the Pixy2 camera through an Arduino (see https://github.com/eriknoorland/arduino-pixy2).

## installation
```
npm install git+https://git@github.com/eriknoorland/nodebot-pixy2.git
```

## states
| State  |
|--------|
| idle   |
| line   |
| blocks |

## usage
```javascript
const Pixy2 = require('nodebot-pixy2');
const pixy2 = Pixy2('/dev/tty.usbserial-A9ITLJ7V');

pixy2.on('data', console.log);

pixy2
  .init()
  .then(() => {
    pixy2.setState('line', {
      pan: 127,
      tilt: 255,
      led: 255,
    });
  });
```
