import archiver from 'archiver';
import chalk from 'chalk';
import { createWriteStream } from 'fs';
import { mkdir, rm, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { ExtensionInputInterface, ExtensionNameVariants } from '../types/extension.types';
import { StringObject } from '../types/general.types';
import { ParserInterface } from '../types/parser.types';
import { getExtensionNameVariants, replaceExtensionNamePlaceholders } from '../utils/extension.utils';

class ExtensionParser implements ParserInterface {
    private readonly extensionNameVariants: ExtensionNameVariants;
    private readonly rootTemplateFolder: string;
    private template: StringObject = {};

    constructor(private readonly input: ExtensionInputInterface) {
        this.extensionNameVariants = getExtensionNameVariants(input.extensionKey);
        this.rootTemplateFolder = `templates/extension/v${this.input.version}`;
    }

    public async parse(): Promise<void> {
        await this.initializeTemplate();
        await this.createExtensionFolder();
        await this.createFilesFromTemplate();

        if (this.input.zip) await this.convertToZip();
    }

    private async createExtensionFolder(): Promise<void> {
        try {
            await mkdir(`./${this.getOutputFolderName()}`);
        } catch (e) {
            console.log(chalk.red(`A folder called "${this.getOutputFolderName()}" already exists in this location`));
        }
    }

    private async createFilesFromTemplate() {
        for (const filePath in this.template) {
            const destination = this.getDestinationFromTemplate(filePath);
            const replacedContents = this.getParsedContentFromTemplate(this.template[filePath]);

            await mkdir(dirname(destination), { recursive: true });
            await writeFile(destination, replacedContents);
        }
    }

    private getDestinationFromTemplate(filePath: string): string {
        return join(
            '.',
            this.getOutputFolderName(),
            replaceExtensionNamePlaceholders(filePath, this.extensionNameVariants)
        );
    }

    private getParsedContentFromTemplate(template: string): string {
        return replaceExtensionNamePlaceholders(template, this.extensionNameVariants)
            .trim()
            .replace(/^ {8}/gm, '');
    }

    private async convertToZip() {
        const outputZipFolderNameParts = [
            this.getOutputFolderName(),
            `${this.input.version}.0.0`,
            ExtensionParser.getExtensionZipFileDateString()
        ];

        const output = createWriteStream(`${outputZipFolderNameParts.join('_')}.zip`);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        archive.pipe(output);
        archive.directory(this.getOutputFolderName(), false);

        await archive.finalize();

        await rm(`./${this.getOutputFolderName()}`, { recursive: true });
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

    private async initializeTemplate() {
        const { default: template } = await import(`../templates/extension/v${this.input.version}`);

        this.template = template;
    }

    private getOutputFolderName() {
        return this.extensionNameVariants.snake;
    }
}

export default ExtensionParser;
