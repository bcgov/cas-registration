// 🛠️ Function to serialize search params
const isInAllowedPath = (pathname: string, allowedList: string[]): boolean => {
  return allowedList.some((allowedPath) => pathname.includes(allowedPath));
};

export default isInAllowedPath;
