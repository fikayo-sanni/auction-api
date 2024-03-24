export const parseBigInts = (
  obj: Record<string, unknown>,
): Record<string, unknown> => {
  // Base case: if the input is not an object or is null, return it as is
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  // If obj is an array, iterate over its elements
  if (Array.isArray(obj)) {
    return obj.map((item) => parseBigInts(item)) as unknown as Record<
      string,
      unknown
    >;
  }

  // Iterate over each key-value pair in the object
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // If the value is a BigInt, convert it to a string
      if (typeof obj[key] === 'bigint') {
        obj[key] = obj[key].toString();
      }
      // If the value is an object or array, recursively call the function
      else if (typeof obj[key] === 'object' && obj[key] !== null) {
        obj[key] = parseBigInts(obj[key] as unknown as Record<string, unknown>);
      }
    }
  }

  return obj;
};
