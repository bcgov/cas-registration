/* eslint-disable */
import http from "k6/http";
import { check } from "k6";
import { industryUserParams } from "../../setup/params.js";

const regulatedProducts = () => {
  const HOST = __ENV.SERVER_HOST;
  // ##### GET #####

  check(http.get(HOST + "/regulated_products", industryUserParams), {
    "is status 200": (r) => r.status === 200,
  });
};

export default regulatedProducts;
