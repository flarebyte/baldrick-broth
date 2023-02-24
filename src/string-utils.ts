const keepAlphaNumeric = (title: string): string => {
  const azText = title.replace(/[^\dA-Za-z-]/g, ' ');
  const singleSpace = azText.replace(/\s+/g, ' ').trim();
  return singleSpace;
};

export const dasherizeTitle = (title: string): string => {
  const azText = keepAlphaNumeric(title);
  return azText === ''
    ? 'empty-title'
    : azText
        .split(' ')
        .map((t) => t.toLowerCase())
        .join('-');
};

export const isStringArray = (value: unknown): value is string[] =>
  typeof value === 'object' &&
  value !== null &&
  Array.isArray(value) &&
  value.length > 0 &&
  typeof value.at(0) === 'string';
