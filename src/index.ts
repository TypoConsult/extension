#!/usr/bin/env node
import chalk from 'chalk';
import clear from 'clear';
import inquirer from 'inquirer';
import ExtensionParser from './parsers/extension.parser';
import ObjectParser from './parsers/object.parser';
import { ExtensionInputInterface } from './types/extension.types';
import { ActionTypes } from './types/general.types';
import { ObjectInputInterface } from './types/object.types';
import { isEmpty, isLowercase, isSnakeCase } from './utils/validation.utils';

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
                name: 'version',
                message: 'TYPO3 target version',
                type: 'list',
                choices: [
                    { name: 'v12', value: 12 },
                    { name: 'v11', value: 11 },
                    { name: 'v10', value: 10 }
                ]
            },
            {
                name: 'extensionKey',
                message: 'Enter extension key (snake_case)',
                type: 'input',
                default: 'tc_base',
                validate(input: string): boolean | string {
                    if (!isLowercase(input)) return 'Extension key must include only lowercase letters';
                    if (!isSnakeCase(input)) return 'Extension key must be in snake_case format';

                    return true;
                }
            },
            {
                name: 'zip',
                message: 'Generate zipped extension?',
                type: 'confirm',
                when: ({ action, version }) => action === ActionTypes.EXTENSION && version < 11
            },
            {
                name: 'objectName',
                message: 'Enter object name (snake_case)',
                type: 'input',
                when: ({ action }) => action === ActionTypes.OBJECT,
                validate(input: string): boolean | string {
                    if (isEmpty(input)) return 'Object name cannot be empty string';
                    if (!isLowercase(input)) return 'Object name must include only lowercase letters';
                    if (!isSnakeCase(input)) return 'Object name must be in snake_case format';

                    return true;
                }
            }
        ]
    )
    .then(async (input: ExtensionInputInterface | ObjectInputInterface) => {
        const parser = new parsers[input.action](input as any);

        await parser.parse();
    })
    .catch(error => {
        console.log(chalk.bold.red('Something went wrong...'));
        console.log(chalk.red(error));
    });

