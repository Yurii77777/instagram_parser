export const convertToCSV = (arr) => {
  const array = [Object.keys(arr[0])].concat(arr);
  return array.map((it) => Object.values(it).join(',')).join('\n');
};
