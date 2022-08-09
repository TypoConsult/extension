export const convertSnakeCaseToKebabCase = (input: string): string => {
    return input.replaceAll('_', '-').toLowerCase();
};

export const convertSnakeCaseToPascalCase = (input: string): string => {
    return input.split('_').map(part => upperCaseFirst(part)).join('');
};

export const convertSnakeCaseToPretty = (input: string): string => {
    const prettyParts = [ 'TC' ];
    const upperCasedParts = input.split('_').map(part => upperCaseFirst(part));

    upperCasedParts.shift();

    prettyParts.push(...upperCasedParts);

    return prettyParts.join(' ');
};

export const upperCaseFirst = (input: string): string => {
    return input.slice(0, 1).toUpperCase() + input.slice(1, input.length);
};

export const generateRandomHexColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16);

