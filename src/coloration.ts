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
  get title() {
    return chalk.blueBright;
  },
};
