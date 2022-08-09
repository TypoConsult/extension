export const isEmpty = (str: string) => {
    return !str || str === '';
};

export const isLowercase = (str: string) => {
    return str.toLowerCase() === str;
};

export const isSnakeCase = (str: string) => {
    return /^[a-z]+(?:_[a-z]+)*$/gm.test(str);
};
