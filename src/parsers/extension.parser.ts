import archiver from 'archiver';
import chalk from 'chalk';
import { createWriteStream } from 'fs';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import glob from 'glob';
import { basename, dirname, join } from 'path';
import { ExtensionNameVariants } from '../types/extension.types';
import { InputInterface } from '../types/general.types';
import { ParserInterface } from '../types/parser.types';
import { getExtensionNameVariants } from '../utils/extension.utils';

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

        if (this.input.zip) await this.convertToZip();
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

    private async convertToZip() {
        const outputFileNameParts = [
            this.extensionNameVariants.snake,
            `${this.input.version}.0.0`,
            ExtensionParser.getExtensionZipFileDateString()
        ];
        const output = createWriteStream(`./${outputFileNameParts.join('_')}.zip`);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        archive.pipe(output);
        archive.glob(`${this.extensionNameVariants.snake}/**/*`);

        await archive.finalize();

        await rm(`./${this.extensionNameVariants.snake}`, { recursive: true });
    }

    private static getExtensionZipFileDateString(): string {
        const now = new Date();

        return [
            now.getFullYear(),
            ('0' + (now.getMonth() + 1)).slice(-2),
            ('0' + now.getDate()).slice(-2),
            ('0' + now.getHours()).slice(-2),
            ('0' + now.getMinutes()).slice(-2)
        ].join('');
    }
}

export default ExtensionParser;
