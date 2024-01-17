import pc from "picocolors";

export const logger = {
    error(...args: (string | number)[]) {
        console.log(...args.map(arg => pc.red(arg)));
    },
    warn(...args: (string | number)[]) {
        console.log(...args.map(arg => pc.yellow(arg)));
    },
    info(...args: (string | number)[]) {
        console.log(...args.map(arg => pc.cyan(arg)));
    },
    success(...args: (string | number)[]) {
        console.log(...args.map(arg => pc.green(arg)));
    },
};
