export enum ActionTypes {
    EXTENSION,
    OBJECT
}

export interface SharedInputInterface {
    action: ActionTypes;
    extensionKey: string;
    version: 10;
}

export type StringObject = { [key: string]: string }
