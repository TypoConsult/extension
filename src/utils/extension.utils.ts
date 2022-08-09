import { ExtensionNameVariants } from '../types/extension.types';
import { convertSnakeCaseToKebabCase, convertSnakeCaseToPascalCase, convertSnakeCaseToPretty } from './general.utils';

export const getExtensionNameVariants = (extensionKey: string): ExtensionNameVariants => ({
    clean: extensionKey.replaceAll('_', ''),
    kebab: convertSnakeCaseToKebabCase(extensionKey),
    pascal: convertSnakeCaseToPascalCase(extensionKey),
    prefixed: `tx_${extensionKey.replaceAll('_', '').toLowerCase()}`,
    pretty: convertSnakeCaseToPretty(extensionKey),
    snake: extensionKey
});

export const replaceExtensionNamePlaceholders = (input: string, extensionNameVariants: ExtensionNameVariants): string => {
    return input
        .replaceAll('{{extensionNameClean}}', extensionNameVariants.clean)
        .replaceAll('{{extensionNameKebab}}', extensionNameVariants.kebab)
        .replaceAll('{{extensionNamePascal}}', extensionNameVariants.pascal)
        .replaceAll('{{extensionNamePrefixed}}', extensionNameVariants.prefixed)
        .replaceAll('{{extensionNamePretty}}', extensionNameVariants.pretty)
        .replaceAll('{{extensionNameSnake}}', extensionNameVariants.snake);
};
