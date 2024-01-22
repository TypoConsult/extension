import { Blocks, Options } from "../types/code.types";

class Builder {
    private readonly options: Options;

    constructor(options: Partial<Options> = {}) {
        this.options = Object.assign(
            {
                indentSize: 4,
                newLine: "\n",
            },
            options,
        );
    }

    public build(blocks: Blocks, level: number = 0): string {
        const code: string[] = [];

        blocks.forEach(block => {
            // Recurrsively handle nested block with correct indentation
            if (Array.isArray(block)) {
                code.push(this.build(block, level + 1));
                return;
            }

            // Insert blank lines for empty strings
            if (block.trim() === "") {
                code.push("");
                return;
            }

            const indent = " ".repeat(level * this.options.indentSize);
            code.push(`${indent}${block}`);
        });

        return code.join(this.options.newLine);
    }
}

export default Builder;
