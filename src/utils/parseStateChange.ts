import { StateChangeData } from '../types';

export default (data: StateChangeData) => {
  return {
    code: data[0],
    state: data[1],
    frameWidth: data[2],
    frameHeight: data[3]
  };
};
