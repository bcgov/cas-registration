import dayjs from "dayjs";

/**
 * Formats a date according to the provided format string.
 *
 * @param dateString - The date to format, which can be a string, number, or Date object.
 * @param format - The format string to use for formatting the date.
 * @returns The formatted date as a string.
 */
export const formatDate = (
  dateString: string | number | Date,
  format: string,
): string => {
  return dayjs(dateString).format(format);
};
