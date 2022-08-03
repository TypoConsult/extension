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
