import { SharedInputInterface, StringObject } from './general.types';

export interface ObjectInputInterface extends SharedInputInterface {
    objectName: string;
}

export interface ObjectNameVariants {
    pascal: string,
    table: string
}

export interface ObjectTemplate {
    append: {
        [filePath: string]: {
            content: string,
            insertBefore?: string,
            insertAtEndOfFile?: boolean
        }
    },
    create: StringObject
}
