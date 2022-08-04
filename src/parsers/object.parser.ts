import chalk from 'chalk';
import { ParserInterface } from '../types/parser.types';
import { InputInterface } from '../types/general.types';

class ObjectParser implements ParserInterface {
    constructor(private readonly input: InputInterface) {}

    async parse(): Promise<void> {
        console.log(chalk.green(
            'This feature is still in active development, and therefore does not generate any files yet.'));
    }
}

export default ObjectParser;
