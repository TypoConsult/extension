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

    public async createExtension(): Promise<{ path: string; composerName: string }> {
        await this.createExtensionFolder();
        await this.copyTemplateFilesToNewFolder();
        await this.handleReplacements();
        await this.handleLintingSetup();
        await this.handleTestSetup();

        return { path: this.folderPath, composerName: this.nameVariants.kebab };
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
        console.log(__dirname);
        await cp(join("templates", "extension", this.input.version.toString()), this.folderPath, { recursive: true });
    }

    private async createExtensionFolder() {
        console.log(__dirname);
        if (await exists(this.folderPath)) {
            logger.error(`\nThe folder "${this.folderPath}" already exists`);
            process.exit(1);
        }

        await mkdir(this.folderPath, { recursive: true });
    }

    private async handleLintingSetup() {
        // Exit if linting is not chosen
        if (!this.input.linting) {
            return;
        }

        const { path, content } = await this.getComposer();

        // Add dependencies
        content["require-dev"]["phpstan/phpstan"] = "^1.10";
        content["require-dev"]["squizlabs/php_codesniffer"] = "^3.8";

        // Add scripts
        content["scripts"]["lint:check:stan"] = "phpstan analyse -l 5 Classes";
        content["scripts"]["lint:check:cs"] = "phpcs --standard=PSR12 Classes";
        content["scripts"]["lint:check"] = ["@lint:check:stan", "@lint:check:cs"];
        content["scripts"]["lint:fix:cs"] = "phpcbf --standard=PSR12 Classes";
        content["scripts"]["lint:fix"] = ["@lint:fix:cs"];

        await writeFile(path, JSON.stringify(content, null, 4));
    }

    private async handleTestSetup() {
        // Exit if tests is not chosen
        if (!this.input.tests) {
            return;
        }

        // Create tests folder
        await mkdir(join(this.folderPath, "tests"));
        await writeFile(join(this.folderPath, "tests", ".gitkeep"), "");

        // Update composer.json
        const { path, content } = await this.getComposer();

        // Add dependencies
        content["require-dev"]["phpunit/phpunit"] = "^10";

        // Add script
        content["scripts"]["tests"] = "phpunit tests --testdox";

        // Adjust linting scripts
        if (this.input.linting) {
            content["scripts"]["lint:check:stan"] += " tests";
            content["scripts"]["lint:check:cs"] += " tests";
            content["scripts"]["lint:fix:cs"] += " tests";
        }

        await writeFile(path, JSON.stringify(content, null, 4));
    }

    private async getComposer() {
        const composerPath = join(this.folderPath, "composer.json");
        const composerContent = await readFile(composerPath, { encoding: "utf8" });
        const composer = JSON.parse(composerContent);

        if (!("require-dev" in composer)) {
            composer["require-dev"] = {};
        }

        if (!("scripts" in composer)) {
            composer["scripts"] = {};
        }

        return { path: composerPath, content: composer };
    }
}

export default ExtensionService;
