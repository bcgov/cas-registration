const formatTimestamp = (timestamp: string) => {
  if (!timestamp) return undefined;

  const date = new Date(timestamp).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Vancouver",
  });

  const timeWithTimeZone = new Date(timestamp).toLocaleString("en-CA", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
    timeZone: "America/Vancouver",
  });

  // Return with a line break so we can display date and time on separate lines
  // in the DataGrid cell using whiteSpace: "pre-line" CSS
  return `${date}\n${timeWithTimeZone}`;
};

export default formatTimestamp;
