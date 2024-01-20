import { Blocks, LineObject, Options } from "../types/code.types";

class Reader {
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

    public getBlocks(content: string): Blocks {
        // Split content into line objects by the newLine and indent size options
        const lines: LineObject[] = content.split(this.options.newLine).map(line => {
            return { content: line.trim(), level: this.getLevel(line) };
        });

        return this.generateNestedArray(lines);
    }

    private getLevel(line: string) {
        // Calculate level from configured indentation
        const re = new RegExp(" ".repeat(this.options.indentSize), "g");

        return (line.match(re) || []).length;
    }

    private generateNestedArray(input: LineObject[], startLevel: number = 0): Blocks {
        const result: Blocks = [];
        let inNested = false;

        input.forEach(({ content, level }, index) => {
            // Insert into current container if it's the same level
            if (level === startLevel) {
                result.push(content);
                inNested = false;
            } else if (level === (startLevel + 1) && !inNested) {
                // Find the items that are inside
                const nestedItems = [];
                for (let i = index; i < input.length; i++) {
                    const item = input[i];

                    if (item.level < level) {
                        break;
                    }

                    nestedItems.push(item);
                }

                result.push(this.generateNestedArray(nestedItems, level));
                inNested = true;
            }
        });

        return result;
    }
}

export default Reader;
