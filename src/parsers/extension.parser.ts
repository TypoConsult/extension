import archiver from 'archiver';
import chalk from 'chalk';
import { createWriteStream } from 'fs';
import { mkdir, rm, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { ExtensionNameVariants } from '../types/extension.types';
import { InputInterface } from '../types/general.types';
import { ParserInterface } from '../types/parser.types';
import { getExtensionNameVariants } from '../utils/extension.utils';

class ExtensionParser implements ParserInterface {
    private readonly extensionNameVariants: ExtensionNameVariants;
    private readonly rootTemplateFolder: string;
    private template: { [key: string]: string } = {};

    constructor(private readonly input: InputInterface) {
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
            await mkdir(`./${this.extensionNameVariants.snake}`);
        } catch (e) {
            console.log(chalk.red(`A folder called "${this.extensionNameVariants.snake}" already exists in this location`));
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

    private replacePlaceholders(input: string): string {
        return input
            .replaceAll('{{extensionNameClean}}', this.extensionNameVariants.clean)
            .replaceAll('{{extensionNameKebab}}', this.extensionNameVariants.kebab)
            .replaceAll('{{extensionNamePascal}}', this.extensionNameVariants.pascal)
            .replaceAll('{{extensionNamePrefixed}}', this.extensionNameVariants.prefixed)
            .replaceAll('{{extensionNamePretty}}', this.extensionNameVariants.pretty)
            .replaceAll('{{extensionNameSnake}}', this.extensionNameVariants.snake);
    }

    private getDestinationFromTemplate(filePath: string): string {
        return join(
            '.',
            this.extensionNameVariants.snake,
            this.replacePlaceholders(filePath)
        );
    }

    private getParsedContentFromTemplate(template: string): string {
        return this.replacePlaceholders(template)
                   .trim()
                   .replace(/^ {8}/gm, '');
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

    private async initializeTemplate() {
        const { default: template } = await import(`../templates/extension/v${this.input.version}`);

        this.template = template;
    }
}

export default ExtensionParser;
