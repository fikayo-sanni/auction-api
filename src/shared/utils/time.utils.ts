export const addMillisecondsToCurrent = (millisecondsToAdd: number): Date => {
  const currentTimestamp = Date.now(); // Get current timestamp in milliseconds
  const newTimestamp = currentTimestamp + millisecondsToAdd; // Add milliseconds
  return new Date(newTimestamp); // Create a new Date object with the updated timestamp
};
