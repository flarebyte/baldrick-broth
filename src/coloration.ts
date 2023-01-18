import { Chalk } from 'chalk';
const chalk = new Chalk();

export const coloration = {
  get motivation() {
    return chalk.gray;
  },
  get warn() {
    return chalk.yellow;
  },
  get path() {
    return chalk.blue;
  },
  get expected() {
    return chalk.greenBright;
  },
  get actual() {
    return chalk.redBright;
  },
  get taskTitle() {
    return chalk.hex('#800080').bold.underline;
  },
  get stepTitle() {
    return chalk.hex('#4B0082');
  },
};
