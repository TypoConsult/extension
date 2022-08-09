import { ObjectNameVariants } from '../types/object.types';
import { getExtensionNameVariants } from './extension.utils';
import { convertSnakeCaseToPascalCase } from './general.utils';

export const getObjectNameVariants = (objectName: string, extensionKey: string): ObjectNameVariants => {
    const extensionNameVariants = getExtensionNameVariants(extensionKey);

    return {
        pascal: convertSnakeCaseToPascalCase(objectName),
        table: `tx_${extensionNameVariants.clean}_domain_model_${objectName}`
    };
};

export const replaceObjectNamePlaceholders = (input: string, objectNameVariants: ObjectNameVariants): string => {
    return input
        .replaceAll('{{objectNamePascal}}', objectNameVariants.pascal)
        .replaceAll('{{objectTableName}}', objectNameVariants.table);
};
