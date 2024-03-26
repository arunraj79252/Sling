export const generateColorHsl = (name, saturationRange, lightnessRange) => {
  const hash = getHashOfString(name);
  const h = normalizeHash(hash, 0, 360);
  const s = normalizeHash(hash, saturationRange[0], saturationRange[1]);
  const l = normalizeHash(hash, lightnessRange[0], lightnessRange[1]);
  return `hsl(${h},${s}%,${l}%)`
};
const getHashOfString = (str="sample") => {
  
  let hash = 0;
  for (let i = 0; i < str?.length; i++) {
    // tslint:disable-next-line: no-bitwise
    hash = str?.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  return hash;
};

const normalizeHash = (hash, min, max) => {
  return Math.floor((hash % (max - min)) + min);
};
