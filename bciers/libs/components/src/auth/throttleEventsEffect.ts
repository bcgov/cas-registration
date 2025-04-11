import throttle from "lodash.throttle";

/**
 * Sets up throttled event listeners on the window object.
 *
 * @param callback - The function to be throttled and executed on events.
 * @param events - Array of DOM event names to listen for.
 * @param throttleTime - Throttle delay in seconds (default: 5 minutes).
 * @returns A setup function that returns a cleanup function.
 */
const createThrottledEventHandler = (
  callback: () => void,
  events: string[],
  throttleTime: number = 60 * 5, // 5 minutes default
): (() => () => void) => {
  return () => {
    const throttled = throttle(callback, throttleTime * 1000, {
      leading: false, // Do not call immediately
    });

    events.forEach((event) => {
      window.addEventListener(event, throttled);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, throttled);
      });
      throttled.cancel();
    };
  };
};

export default createThrottledEventHandler;
