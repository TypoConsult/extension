#!/usr/bin/env node
import chalk from "chalk";
import { ActionTypes } from "./types/general.types";
import { logger } from "./utils/logger";
import * as p from "@clack/prompts";
import { setTimeout } from "node:timers/promises";
import { isEmpty, isLowercase, isSnakeCase } from "./utils/validation.utils";

const main = async () => {
    // Clear the current terminal session before starting
    console.clear();

    // Print the CLI title
    p.intro(chalk.hex("#FF8700").bold("TYPO3 Extension Utility CLI"));

    // Ask the questions
    const project = await p.group(
        {
            action: () => p.select({
                message: "What do you want to do?",
                options: [
                    { label: "Create extension", value: ActionTypes.EXTENSION },
                    { label: "Add object", value: ActionTypes.OBJECT },
                ],
                initialValue: ActionTypes.EXTENSION,
            }),
            version: () => p.select({
                message: "TYPO3 target version",
                options: [
                    { label: "v12", value: 12 },
                ],
                initialValue: 12,
            }),
            extensionKey: () => p.text({
                message: "Enter extension key",
                defaultValue: "tc_base",
                placeholder: "tc_base",
                validate(input: string): void | string {
                    if (!input) {
                        return;
                    }

                    if (!isLowercase(input)) {
                        return "Extension key must include only lowercase letters";
                    }

                    if (!isSnakeCase(input)) {
                        return "Extension key must be in snake_case format";
                    }
                },
            }),
            objectName: ({ results }) => {
                if (results.action !== ActionTypes.OBJECT) {
                    return;
                }

                return p.text({
                    message: "Enter object name",
                    validate(input: string): void | string {
                        if (isEmpty(input)) return "Object name cannot be empty string";
                        if (!isLowercase(input)) return "Object name must include only lowercase letters";
                        if (!isSnakeCase(input)) return "Object name must be in snake_case format";
                    },
                });
            },
            linting: ({ results }) => {
                if (results.action !== ActionTypes.EXTENSION) {
                    return;
                }

                return p.confirm({
                    message: "Use linting?",
                    initialValue: true,
                });
            },
            tests: ({ results }) => {
                if (results.action !== ActionTypes.EXTENSION) {
                    return;
                }

                return p.confirm({
                    message: "Use tests?",
                    initialValue: false,
                });
            },
        },
        {
            onCancel() {
                process.exit(1);
            },
        },
    );

    const s = p.spinner();
    s.start("Loading...");
    await setTimeout(2500);
    s.stop("Finished");

    if (project.action === ActionTypes.EXTENSION) {
        const nextSteps = `cd ..\ncomposer require ${project.extensionKey}`;
        p.note(nextSteps, "Next steps");
    }

    if (project.action === ActionTypes.OBJECT) {
        const nextSteps = `git add . && git commit -m "Introduce ${project.objectName} object"`;
        p.note(nextSteps, "Next steps");
    }

    p.outro(`Problems? ${chalk.underline(chalk.cyan("https://github.com/TypoConsult/extension/issues"))}`);
};

main().catch((err) => {
    logger.error("An unknown error has occurred:");
    console.log(err);
    process.exit(1);
});

