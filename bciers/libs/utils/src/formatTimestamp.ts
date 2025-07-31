const formatTimestamp = (timestamp: string) => {
  if (!timestamp) return undefined;

  const includesTime = timestamp.includes("T");

  // If the timestamp contains a time, use it as-is. If the timestamp is only a date, add midnight in local time so Date doesn't convert it to UTC.
  if (!includesTime) {
    timestamp = `${timestamp}T00:00`;
  }
  const date = new Date(timestamp).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Vancouver",
  });
  const timeWithTimeZone = new Date(timestamp).toLocaleString("en-CA", {
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
    timeZone: "America/Vancouver",
  });

  // If timestamp includes time, return with a line break so we can display date and time on separate lines in the DataGrid cell using whiteSpace: "pre-line" CSS
  return includesTime ? `${date}\n${timeWithTimeZone}` : date;
};

export default formatTimestamp;
