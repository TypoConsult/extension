import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { ExtensionNameVariants } from "../types/extension.types";
import { SharedInputInterface, StringObject } from "../types/general.types";
import { ParserInterface } from "../types/parser.types";
import { getExtensionNameVariants, replaceExtensionNamePlaceholders } from "../utils/extension.utils";
import pc from "picocolors";

class ExtensionParser implements ParserInterface {
    private readonly extensionNameVariants: ExtensionNameVariants;
    private template: StringObject = {};
    private os = require("node:os");

    constructor(private readonly input: SharedInputInterface) {
        this.extensionNameVariants = getExtensionNameVariants(input.extensionKey);
    }

    public async parse(): Promise<void> {
        await this.initializeTemplate();
        await this.createExtensionFolder();
        await this.createFilesFromTemplate();
    }

    private async createExtensionFolder(): Promise<void> {
        try {
            await mkdir(`./${this.getOutputFolderName()}`);
        } catch (e) {
            console.log(pc.red(`"${this.getOutputFolderName()}" already exists in this location`));
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
            ".",
            this.getOutputFolderName(),
            replaceExtensionNamePlaceholders(filePath, this.extensionNameVariants),
        );
    }

    private getParsedContentFromTemplate(template: string): string {
        return replaceExtensionNamePlaceholders(template, this.extensionNameVariants)
            .trim()
            .replace(/^ {8}/gm, "") + this.os.EOL;
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
