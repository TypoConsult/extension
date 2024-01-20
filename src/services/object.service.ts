import { PrompsAnswersInterface } from "../types/general.types";
import { getObjectNameVariants, replaceObjectNamePlaceholders } from "../utils/object.utils";
import { ObjectNameVariants } from "../types/object.types";
import { exists, getFiles } from "../utils/file.utils";
import { join } from "path";
import { readFile, writeFile } from "fs/promises";
import { logger } from "../utils/logger";
import { getExtensionNameVariants, replaceExtensionNamePlaceholders } from "../utils/extension.utils";
import { generateRandomHexColor } from "../utils/general.utils";
import { Builder, Parser } from "xml2js";
import CodeBuilder from "../code/builder";
import CodeReader from "../code/reader";
import { Block } from "../types/code.types";
import { ExtensionNameVariants } from "../types/extension.types";

class ObjectService {
    private readonly nameVariants: ObjectNameVariants;
    private readonly extNameVariants: ExtensionNameVariants;
    private readonly folderPath: string;

    constructor(private input: PrompsAnswersInterface) {
        if (!input.objectName) {
            process.exit(1);
        }

        this.nameVariants = getObjectNameVariants(input.objectName, input.extensionKey);
        this.extNameVariants = getExtensionNameVariants(this.input.extensionKey);
        this.folderPath = join(this.input.targetFolder, input.extensionKey);
    }

    public async createObject() {
        await this.validateFolderPath();
        await this.createNewFilesFromTemplate();
        await this.updateLanguageFiles();
        await this.updateSqlFile();
        await this.updatePhpFiles();

        return { pascalName: this.nameVariants.pascal };
    }

    private async createNewFilesFromTemplate() {
        const templateFolderPath = join("templates", "object", this.input.version.toString());
        const templateFiles = await getFiles(templateFolderPath);

        for (const templateFilePath of templateFiles) {
            let targetPath = replaceObjectNamePlaceholders(templateFilePath, this.nameVariants);
            targetPath = targetPath.split(templateFolderPath)[1];
            targetPath = join(this.folderPath, targetPath);

            const templateContent = await readFile(templateFilePath, { encoding: "utf8" });

            await writeFile(targetPath, replaceExtensionNamePlaceholders(replaceObjectNamePlaceholders(templateContent, this.nameVariants), this.extNameVariants).replaceAll("randomHexColor", generateRandomHexColor()));
        }
    }

    private async validateFolderPath() {
        const valid = await exists(this.folderPath);

        if (!valid) {
            logger.error(`\nCould not find target directory: ${this.folderPath}`);
            process.exit(1);
        }
    }

    private async updateLanguageFiles() {
        const files = await getFiles(join(this.folderPath, "Resources", "Private", "Language"));

        for (const path of files) {
            // Skip non db files
            if (!path.includes("_db")) {
                continue;
            }

            const parser = new Parser();
            const result = await parser.parseStringPromise(await readFile(path));
            const tagName = path.includes("/locallang_db.xlf") ? "source" : "target";

            result.xliff.file[0].body[0]["trans-unit"].push({
                "$": { id: this.nameVariants.table },
                [tagName]: [this.nameVariants.pascal],
            });

            result.xliff.file[0].body[0]["trans-unit"].push({
                "$": { id: `${this.nameVariants.table}.title` },
                [tagName]: ["Title"],
            });

            const builder = new Builder({
                xmldec: { version: "1.0", encoding: "UTF-8" },
                renderOpts: { pretty: true, indent: "    ", newline: "\n" },
            });
            const xml = builder.buildObject(result);

            await writeFile(path, xml);
        }
    }

    private async updateSqlFile() {
        const builder = new CodeBuilder();
        const code = builder.build([
            `CREATE TABLE ${this.nameVariants.table}`,
            "(",
            [
                "title VARCHAR(255) DEFAULT '' NOT NULL",
            ],
            ");",
            "",
        ]);

        const path = join(this.folderPath, "ext_tables.sql");
        const content = await readFile(path, { encoding: "utf8" });

        await writeFile(path, content + code);
    }

    private async updatePhpFiles() {
        // Only add object to extbase mappings for multi-word object names
        if (!this.nameVariants.snake.includes("_")) {
            return;
        }

        const path = join(this.folderPath, "Configuration", "Extbase", "Persistence", "Classes.php");
        const content = await readFile(path, { encoding: "utf8" });
        const reader = new CodeReader();
        let blocks = reader.getBlocks(content);

        // Find use statements
        const useStatements = blocks.filter((block) => typeof block === "string" && block.startsWith("use "));
        const useIndicies = blocks.map((block, index) => typeof block === "string" && block.startsWith("use ") ? index : null).filter(x => Boolean(x));
        const startIndex = useIndicies[0];
        const endIndex = useIndicies.pop();

        useStatements.push(`use TYPOCONSULT\\${this.extNameVariants.pascal}\\Domain\\Model\\${this.nameVariants.pascal};`);
        useStatements.sort();

        if (startIndex && endIndex) {
            blocks = [...blocks.slice(0, startIndex), ...useStatements, ...blocks.slice(endIndex + 1)];
        }

        // Find the block that returns the mappings
        const returnBlock: Block = blocks[blocks.findIndex((block) => typeof block === "string" && block.startsWith("return")) + 1];

        if (Array.isArray(returnBlock)) {
            returnBlock[returnBlock.length - 1] = "],";
            returnBlock.push(
                `${this.nameVariants.pascal}::class => [`,
                // @ts-ignore
                [`'tableName' => ${this.nameVariants.pascal}::TABLE_NAME`],
                "]",
            );
        }

        const builder = new CodeBuilder();
        await writeFile(path, builder.build(blocks));
    }
}

export default ObjectService;
