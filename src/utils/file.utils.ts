import { access } from "fs/promises";
import { constants, readdir } from "node:fs/promises";
import { resolve } from "path";

export async function exists(path: string): Promise<boolean> {
    try {
        await access(path, constants.F_OK);
        return true;
    } catch (e) {
        return false;
    }
}

export async function getFiles(dir: string): Promise<string[]> {
    const dirents = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
        const res = resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : [res];
    }));

    return files.flat();
}
