export const copyObject = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const concatObjects = (...records) => {
  return Object.assign({}, ...records.map(it => copyObject(it)));
};

export const randomNumber = (min = 0, max = 1, floor = false) => {
  const value = (Math.random() * (max - min)) + min;

  if (floor) {
    return Math.floor(value);
  }

  return value;
};

export const randomBool = () => {
  const value = randomNumber();

  return value > 0.5;
};

export const randomArrayItem = (arr) => {
  if (!arr?.length) {
    return undefined;
  }

  const length = arr.length;
  const index = Math.floor(randomNumber(0, length)) % length;

  return arr[index];
};

const idKeys = 'qwertyuiopasdfghjklzxcvbnm0123456789'.split('');

export const randomId = (length = 5) => {
  return (new Array(length).fill(null).map(() => {
    const key = randomArrayItem(idKeys);
    const isUppercase = randomBool();

    return isUppercase ? key.toUpperCase() : key;
  })).join('');
};

const PATH_RULES = {
  start: /\/$/,
  default: /^\//
};
const ROOT_PATH = location.href;
export function resolvePath(url) {
  const parts = [ROOT_PATH, url].map((it, index) => {
    const reg = index === 0 ? PATH_RULES.start : PATH_RULES.default;

    return it.replace(reg, '');
  });

  return parts.join("/");
}
