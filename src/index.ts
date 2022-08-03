#!/usr/bin/env node
import clear from 'clear';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { ActionTypes, InputInterface } from './types/general.types';
import ExtensionParser from './parsers/extension.parser';
import ObjectParser from './parsers/object.parser';

clear();

console.log(chalk.hex('#FF8700').bold('TYPO3 Extension Utility CLI'));

const parsers = {
    [ActionTypes.EXTENSION]: ExtensionParser,
    [ActionTypes.OBJECT]: ObjectParser
};

inquirer
    .prompt(
        [
            {
                name: 'action',
                message: 'What do you want to do?',
                type: 'list',
                choices: [
                    { name: 'Create extension', value: ActionTypes.EXTENSION },
                    { name: 'Add object', value: ActionTypes.OBJECT }
                ]
            },
            {
                name: 'extensionKey',
                message: 'Enter extension key',
                type: 'input',
                default: 'tc_base',
                validate(input: string): boolean | string {
                    if (!input.startsWith('tc_')) return 'Extension key must start with "tc_"';
                    if (input.toLowerCase() !== input) return 'Extension key may not include uppercase letters';
                    if (!/^[a-z]+(?:_[a-z]+)*$/gm.test(input)) return 'Extension key must be in snake_case format';

                    return true;
                }
            },
            {
                name: 'version',
                message: 'TYPO3 target version',
                type: 'list',
                choices: [
                    { name: 'v10', value: 10 }
                ]
            },
            {
                name: 'zip',
                message: 'Generate zipped extension?',
                type: 'confirm',
                when: ({ action }) => action === ActionTypes.EXTENSION
            },
            {
                name: 'objectName',
                message: 'Enter object name',
                type: 'input',
                when: ({ action }) => action === ActionTypes.OBJECT
            }
        ]
    )
    .then(async (input: InputInterface) => {
        const parser = new parsers[input.action](input);

        await parser.parse();
    })
    .catch(error => {
        console.log(chalk.bold.red('Something went wrong...'));
        console.log(chalk.red(error));
    });

