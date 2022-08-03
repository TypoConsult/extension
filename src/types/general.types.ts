export enum ActionTypes {
    EXTENSION,
    OBJECT
}

export interface InputInterface {
    action: ActionTypes;
    extensionKey: string;
    objectName?: string;
    version: 10;
    zip?: boolean;
}
