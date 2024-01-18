import { PrompsAnswersInterface } from "../types/general.types";
import { cp, mkdir, readFile, rename, writeFile } from "fs/promises";
import { join } from "path";
import { logger } from "../utils/logger";
import { getExtensionNameVariants, replaceExtensionNamePlaceholders } from "../utils/extension.utils";
import { ExtensionNameVariants } from "../types/extension.types";
import { exists, getFiles } from "../utils/file.utils";

class ExtensionService {
    private readonly folderPath: string;
    private readonly nameVariants: ExtensionNameVariants;

    constructor(private input: PrompsAnswersInterface) {
        this.nameVariants = getExtensionNameVariants(input.extensionKey);
        this.folderPath = join(this.input.targetFolder, this.nameVariants.snake);
    }

    public async createExtension(): Promise<void> {
        await this.createExtensionFolder();
        await this.copyTemplateFilesToNewFolder();
        await this.handleReplacements();
    }

    private async handleReplacements() {
        const files = await getFiles(this.folderPath);

        for (const path of files) {

            // Handle replacements in file content
            const content = (await readFile(path, { encoding: "utf8" })).toString();

            await writeFile(path, replaceExtensionNamePlaceholders(content, this.nameVariants));

            // Handle file name replacements
            await rename(path, replaceExtensionNamePlaceholders(path, this.nameVariants));
        }
    }

    private async copyTemplateFilesToNewFolder() {
        await cp(join("templates", "extension", this.input.version.toString()), this.folderPath, { recursive: true });
    }

    private async createExtensionFolder() {
        if (await exists(this.folderPath)) {
            logger.error(`\nThe folder "${this.folderPath}" already exists`);
            process.exit(1);
        }

        await mkdir(this.folderPath, { recursive: true });
    }
}

export default ExtensionService;
