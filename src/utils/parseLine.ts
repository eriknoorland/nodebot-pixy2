import { LineData } from '../types';

export default (data: LineData) => {
  return {
    index: data[0],
    flags: data[1],
    x0: data[2],
    y0: data[3],
    x1: data[4],
    y1: data[5]
  };
};
