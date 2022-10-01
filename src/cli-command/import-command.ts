import TSVFileReader from '../common/file-reader/tsv-file-reader.js';
import {CliCommandInterface} from './cli-command.interface.js';
import chalk from 'chalk';

export default class ImportCommand implements CliCommandInterface {
  readonly name = '--import';

  execute(filename: string): void {
    const fileReader = new TSVFileReader(filename.trim());

    try {
      fileReader.read();
      console.log(fileReader.toArray());
    } catch (err) {
      if (err instanceof Error) {
        console.log(chalk.bgRed(chalk.black(`Не удалось импортировать данные из файла из-за ошибки: «${err.message}»`)));
      }
    }
  }
}
