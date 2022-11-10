import chalk from 'chalk';
import { dirname, join } from 'path';
import { ExtensionNameVariants } from '../types/extension.types';
import { ObjectInputInterface, ObjectNameVariants, ObjectTemplate } from '../types/object.types';
import { ParserInterface } from '../types/parser.types';
import { getExtensionNameVariants, replaceExtensionNamePlaceholders } from '../utils/extension.utils';
import { generateRandomHexColor } from '../utils/general.utils';
import { getObjectNameVariants, replaceObjectNamePlaceholders } from '../utils/object.utils';
import { access, mkdir, readFile, writeFile } from 'fs/promises';

class ObjectParser implements ParserInterface {
    private readonly extensionNameVariants: ExtensionNameVariants;
    private readonly objectNameVariants: ObjectNameVariants;
    private template?: ObjectTemplate;

    constructor(private readonly input: ObjectInputInterface) {
        this.extensionNameVariants = getExtensionNameVariants(input.extensionKey);
        this.objectNameVariants = getObjectNameVariants(input.objectName, input.extensionKey);
    }

    public async parse(): Promise<void> {
        await this.validateTargetExtension();
        await this.initializeTemplate();
        await this.validateTargetObject();
        await this.createFiles();
        await this.appendToFiles();
    }

    private async initializeTemplate() {
        const { default: template } = await import(`../templates/object/v${this.input.version}`);

        this.template = template;
    }

    private async validateTargetExtension() {
        const extensionKey = this.input.extensionKey;

        try {
            await access(`./${extensionKey}`);
        } catch (e) {
            console.log(chalk.red.bold(`Could not find target extension '${extensionKey}' in this location`));
            process.exit();
        }
    }

    private async validateTargetObject() {
        if (!this.template?.create) {
            console.log(chalk.red.bold('Template does not contain files to create'));
            process.exit();
        }

        const fileState = await Promise.all(
            Object.keys(this.template.create)
                  .map(filePath => access(this.getExtensionFilePath(filePath))
                      .then(() => true)
                      .catch(() => false))
        );

        if (!fileState.every(element => !element)) {
            console.log(chalk.red.bold(`Target object '${this.objectNameVariants.pascal}' already seem to exist in this extension.`));
            process.exit();
        }
    }

    private async createFiles() {
        if (!this.template?.create) return;

        for (const filePath in this.template.create) {
            const destination = this.getExtensionFilePath(filePath);
            const replacedContents = this.getParsedContentFromTemplate(this.template.create[filePath]);

            await mkdir(dirname(destination), { recursive: true });
            await writeFile(destination, replacedContents);

            console.log(chalk.green(`Created file '${destination}'`));
        }
    }

    private async appendToFiles() {
        if (!this.template?.append) return;

        for (const filePath in this.template.append) {
            const conditionFunction = this.template.append[filePath].condition;

            if (conditionFunction && !conditionFunction(this.objectNameVariants)) continue;

            const destination = this.getExtensionFilePath(filePath);

            try {
                await access(destination);
            } catch (e) {
                console.log(chalk.red.bold(`Could not find file '${destination}'`));
                process.exit();
            }

            const {
                appendString,
                content: templateContent,
                insertAtEndOfFile,
                insertBefore,
                prependString,
                spacesToRemove
            } = this.template.append[filePath];
            const buffer = await readFile(destination);
            let content = buffer.toString();

            if (insertAtEndOfFile) {
                if (content !== '') content += '\n\n';

                content += this.getParsedContentFromTemplate(templateContent, spacesToRemove);
            }

            if (insertBefore) {
                const targetIndex = content.indexOf(insertBefore);

                if (targetIndex === -1) {
                    console.log(chalk.red.bold(`Configured insert position '${insertBefore}' was not found`));
                    process.exit();
                }

                content = content.slice(0, targetIndex)
                    + (prependString ?? '')
                    + this.getParsedContentFromTemplate(templateContent, spacesToRemove)
                    + (appendString ?? '')
                    + content.slice(targetIndex);
            }

            await writeFile(destination, content);

            console.log(chalk.yellow(`Updated file '${destination}'`));
        }
    }

    private getExtensionFilePath(filePath: string): string {
        return join(
            '.',
            this.getExtensionFolderName(),
            replaceObjectNamePlaceholders(
                replaceExtensionNamePlaceholders(filePath, this.extensionNameVariants),
                this.objectNameVariants
            )
        );
    }

    private getParsedContentFromTemplate(template: string, spacesToRemove: number = 12): string {
        const spaceRegex = new RegExp(`^ {${spacesToRemove}}`, 'gm');

        return replaceObjectNamePlaceholders(
            replaceExtensionNamePlaceholders(template, this.extensionNameVariants),
            this.objectNameVariants
        )
            .replaceAll('{{randomHexColor}}', generateRandomHexColor())
            .trim()
            .replace(spaceRegex, '');
    }

    private getExtensionFolderName() {
        return this.extensionNameVariants.snake;
    }
}

export default ObjectParser;
