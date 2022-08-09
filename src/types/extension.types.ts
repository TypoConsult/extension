import { SharedInputInterface } from './general.types';

export interface ExtensionInputInterface extends SharedInputInterface {
    zip: boolean;
}

export interface ExtensionNameVariants {
    clean: string;
    kebab: string;
    pascal: string;
    prefixed: string;
    pretty: string;
    snake: string;
}
