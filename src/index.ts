#!/usr/bin/env node
import clear from "clear";
import chalk from "chalk";
import inquirer from 'inquirer';
import { ActionTypes, InputInterface } from "./types/general.types";
import ExtensionParser from "./parsers/extension.parser";
import ObjectParser from "./parsers/object.parser";

clear();

console.log(chalk.hex('#FF8700').bold('TYPO3 Extension Utility CLI'))

inquirer
    .prompt([
        {
            name: 'action',
            message: 'What do you want to do?',
            type: "list",
            choices: [
                { name: 'Create extension', value: ActionTypes.EXTENSION },
                { name: 'Add object', value: ActionTypes.OBJECT }
            ]
        },
        {
            name: 'extensionKey',
            message: 'Enter extension key',
            type: "input",
            default: 'tc_base'
        },
        {
            name: 'objectName',
            message: 'Enter object name',
            type: "input",
            when: ({ action }) => action === ActionTypes.OBJECT
        }
    ])
    .then(async (input: InputInterface) => {
        const parsers = {
            [ActionTypes.EXTENSION]: new ExtensionParser(),
            [ActionTypes.OBJECT]: new ObjectParser()
        }

        await parsers[input.action].parse(input);
    })
    .catch(error => {
        console.log(chalk.bold.red('Something went wrong...'));
        console.log(chalk.red(error));
    });

