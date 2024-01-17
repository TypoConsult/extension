export enum ActionTypes {
    EXTENSION,
    OBJECT
}

export interface SharedInputInterface {
    action: ActionTypes;
    extensionKey: string;
    version: number;
}

export type StringObject = { [key: string]: string }
