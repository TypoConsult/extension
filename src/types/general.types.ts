export enum ActionTypes {
    EXTENSION,
    OBJECT
}

export interface PrompsAnswersInterface {
    action: ActionTypes;
    version: 12;
    extensionKey: string;
    targetFolder: string;
    objectName?: string;
    linting?: boolean;
    tests?: boolean;
}

export type StringObject = { [key: string]: string }
