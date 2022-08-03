import { ParserInterface } from '../types/parser.types';
import { InputInterface } from '../types/general.types';
import { getExtensionNameVariants } from '../utils/extension.utils';
import { ExtensionNameVariants } from '../types/extension.types';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { basename, dirname, join } from 'path';
import chalk from 'chalk';
import glob from 'glob';

class ExtensionParser implements ParserInterface {
    private readonly extensionNameVariants: ExtensionNameVariants;
    private readonly rootTemplateFolder: string;
    private readonly templateFiles: string[];

    // default generated file extension is .php
    private readonly fileExtensionMap: { [key: string]: string } = {
        'Configuration/Services': 'yaml',
        'Configuration/TypoScript/constants': 'typoscript',
        'Configuration/TypoScript/setup': 'typoscript',
        'Resources/Private/JavaScripts/general': 'js',
        'Resources/Private/Language/da.locallang': 'xlf',
        'Resources/Private/Language/da.locallang_db': 'xlf',
        'Resources/Private/Language/locallang': 'xlf',
        'Resources/Private/Language/locallang_db': 'xlf',
        'Resources/Private/Partials/Bodytext': 'html',
        'Resources/Private/Plugin/Show': 'html',
        'Resources/Private/StyleSheets/general': 'scss',
        'Resources/Public/Icons/extensions-{{extensionNameClean}}_plugin': 'svg',
        'composer': 'json',
        'ext_conf_template': 'txt',
        'ext_icon': 'svg',
        'ext_tables.sql': ''
    };

    constructor(private readonly input: InputInterface) {
        this.extensionNameVariants = getExtensionNameVariants(input.extensionKey);
        this.rootTemplateFolder = `templates/extension/v${this.input.version}`;
        this.templateFiles = glob.sync(`${this.rootTemplateFolder}/**/*.txt`);
    }

    public async parse(): Promise<void> {
        await this.createExtensionFolder();
        await this.createFilesFromTemplate();
    }

    private async createExtensionFolder(): Promise<void> {
        try {
            await mkdir(`./${this.extensionNameVariants.snake}`);
        } catch (e) {
            console.log(chalk.red(`A folder called "${this.extensionNameVariants.snake}" already exists in this location`));
        }
    }

    private async createFilesFromTemplate() {
        for (const templateFile of this.templateFiles) {
            const destination = this.getDestinationFromTemplateFile(templateFile);
            const replacedContents = await this.getParsedTemplateFileContents(templateFile);

            await mkdir(dirname(destination), { recursive: true });
            await writeFile(destination, replacedContents);
        }
    }

    private async getParsedTemplateFileContents(templateFile: string) {
        const contents = await readFile(templateFile, 'utf-8');

        return this.replacePlaceholders(contents);
    }

    private replacePlaceholders(input: string) {
        return input
            .replaceAll('{{extensionNameClean}}', this.extensionNameVariants.clean)
            .replaceAll('{{extensionNameKebab}}', this.extensionNameVariants.kebab)
            .replaceAll('{{extensionNamePascal}}', this.extensionNameVariants.pascal)
            .replaceAll('{{extensionNamePrefixed}}', this.extensionNameVariants.prefixed)
            .replaceAll('{{extensionNamePretty}}', this.extensionNameVariants.pretty)
            .replaceAll('{{extensionNameSnake}}', this.extensionNameVariants.snake);
    }

    private getDestinationFromTemplateFile(templateFile: string) {
        const fileDirName = dirname(templateFile);
        const fileBaseName = basename(templateFile, '.txt');
        const extensionRelativeDirName = fileDirName.replace(this.rootTemplateFolder, '').replace('/', '');
        const destinationExtension = this.fileExtensionMap[join(extensionRelativeDirName, fileBaseName)] ?? 'php';

        return join(
            '.',
            this.extensionNameVariants.snake,
            extensionRelativeDirName,
            `${this.replacePlaceholders(fileBaseName)}${destinationExtension && `.${destinationExtension}`}`
        );
    }
}

export default ExtensionParser;
