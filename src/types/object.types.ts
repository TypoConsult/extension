import { PrompsAnswersInterface, StringObject } from './general.types';

export interface ObjectInputInterface extends PrompsAnswersInterface {
    objectName: string;
}

export interface ObjectNameVariants {
    pascal: string;
    snake: string;
    table: string;
}

export interface ObjectTemplate {
    append: {
        [filePath: string]: {
            appendString?: string;
            condition?: (names: ObjectNameVariants) => boolean;
            content: string;
            insertAtEndOfFile?: boolean;
            insertBefore?: string;
            prependString?: string;
            spacesToRemove: number;
        }
    },
    create: StringObject
}
