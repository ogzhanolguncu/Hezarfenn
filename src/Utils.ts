const isAlpha = (char: string): boolean => {
  return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z") || char == "_";
};

const isAlphaNumeric = (char: string): boolean => {
  return isAlpha(char) || isDigit(char);
};

const isDigit = (char: string): boolean => {
  return char >= "0" && char <= "9";
};

export { isAlpha, isAlphaNumeric, isDigit };
