export type Block = string | string[] | Block[];

export type Blocks = Block[];

export type Options = {
    indentSize: number;
    newLine: string;
};

export type LineObject = {
    content: string;
    level: number;
}
