#!/usr/bin/env node
import { ActionTypes, PrompsAnswersInterface } from "./types/general.types";
import { logger } from "./utils/logger";
import * as p from "@clack/prompts";
import { setTimeout } from "node:timers/promises";
import { isEmpty, isLowercase, isSnakeCase } from "./utils/validation.utils";
import pc from "picocolors";
import ExtensionService from "./services/extension.service";
import { execSync } from "child_process";

const main = async () => {
    // Clear the current terminal session before starting
    console.clear();

    // Print the CLI title
    p.intro(pc.bgCyan(pc.black(" TYPO3 Extension Utility CLI ")));

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
            version: () => p.select<{ label: string; value: 12 }[], 12>({
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
                    if (isEmpty(input)) {
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
            targetFolder: ({ results }) => {
                if (results.action !== ActionTypes.EXTENSION) {
                    return;
                }

                return p.text({
                    message: "Enter target folder",
                    defaultValue: "packages",
                    placeholder: "packages",
                });
            },
            objectName: ({ results }) => {
                if (results.action !== ActionTypes.OBJECT) {
                    return;
                }

                return p.text({
                    message: "Enter object name",
                    validate(input: string): void | string {
                        if (isEmpty(input)) {
                            return "Object name cannot be empty string";
                        }

                        if (!isLowercase(input)) {
                            return "Object name must include only lowercase letters";
                        }

                        if (!isSnakeCase(input)) {
                            return "Object name must be in snake_case format";
                        }
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
            installDependencies: ({ results }) => {
                if (results.action !== ActionTypes.EXTENSION) {
                    return;
                }

                return p.confirm({
                    message: "Install dependencies?",
                    initialValue: true,
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

    // Always wait a little for the effect
    await setTimeout(1000);

    let reqName = "";

    // Execute logic for extension action
    if (project.action === ActionTypes.EXTENSION) {
        const extensionService = new ExtensionService(project as PrompsAnswersInterface);
        const { path, composerName } = await extensionService.createExtension();

        reqName = composerName;

        if (project.installDependencies) {
            execSync(`composer update --working-dir ${path}`, { stdio: "ignore" });
        }
    }

    // Execute logic for object action
    if (project.action === ActionTypes.OBJECT) {

    }

    // Stop the spinner
    s.stop("Finished");

    // Show extension next steps
    if (project.action === ActionTypes.EXTENSION) {
        const nextSteps = `composer require typoconsult/${reqName} @dev`;
        p.note(nextSteps, "Next steps");
    }

    // Show object next steps
    if (project.action === ActionTypes.OBJECT) {
        const nextSteps = `git add . && git commit -m "Introduce ${project.objectName} object"`;
        p.note(nextSteps, "Next steps");
    }

    // Show outro with link to GitHub issues page
    p.outro(`Problems? ${pc.underline(pc.cyan("https://github.com/TypoConsult/extension/issues"))}`);
};

main().catch((err) => {
    logger.error("An unknown error has occurred:");
    console.log(err);
    process.exit(1);
});

