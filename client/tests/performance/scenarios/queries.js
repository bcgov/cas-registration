/* eslint-disable */
import http from "k6/http";
import exec from "k6/execution";

const queries = () => {
  const getParams = {
    // cookies: {
    //   "mocks.auth_role": "industry_user",
    // },
  };

  http.get(__ENV.APP_HOST + "/ROUTE HERE", getParams);
};

export default queries;
