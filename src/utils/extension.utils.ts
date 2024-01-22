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

export const replaceExtensionNamePlaceholders = (input: string, nameVariants: ExtensionNameVariants): string => {
    return input
        .replaceAll('extensionNameClean', nameVariants.clean)
        .replaceAll('extensionNameKebab', nameVariants.kebab)
        .replaceAll('extensionNamePascal', nameVariants.pascal)
        .replaceAll('extensionNamePrefixed', nameVariants.prefixed)
        .replaceAll('extensionNamePretty', nameVariants.pretty)
        .replaceAll('extensionNameSnake', nameVariants.snake);
};
