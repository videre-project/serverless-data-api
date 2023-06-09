/**
 * Creates a promise that resolves after a specified amount of milliseconds.
 */
export const setDelay = ms => {
  return new Promise(res => setTimeout(res, ms));
};

/**
 * Removes undefined object keys.
 */
 export const pruneObjectKeys = object => {
  return Object.entries(object)
    .filter(([, v]) =>
      typeof v == 'object'
        ? (v != null && JSON.stringify(v) != '{}' && JSON.stringify(v) != '[]')
        : v != undefined
    ).reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
};

/**
 * Takes an Array and a grouping function
 * and returns a Map of the array grouped by the grouping function.
 */
export function groupBy(list, keyGetter) {
  const map = new Map();
  list.forEach((item) => {
       const key = keyGetter(item);
       const collection = map.get(key);
       if (!collection) {
           map.set(key, [item]);
       } else {
           collection.push(item);
       }
  });
  return map;
}

/**
 * Sort function with single sort parameter.
 */
function dynamicSort(property) {
  var sortOrder = 1;
  if(property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  };
  return function (a,b) {
    /* next line works with strings and numbers, 
      * and you may want to customize it to your needs
      */
    var result = (a[property] < b[property])
      ? -1
      : (a[property] > b[property])
        ? 1
        : 0;
    return result * sortOrder;
  };
};

/**
 * Sort function with multiple sort parameters.
 */
export function dynamicSortMultiple() {
  var props = arguments;
  return function (obj1, obj2) {
    var i = 0, result = 0, numberOfProperties = props.length;
    while(result === 0 && i < numberOfProperties) {
      result = dynamicSort(props[i])(obj1, obj2);
      i++;
    };
    return result;
  };
};