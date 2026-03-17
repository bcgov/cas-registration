/* eslint-disable */
import { SERVER_HOST } from "../../setup/constants.js";
import { getUserParams, makeRequest } from "../../setup/helpers.js";

function getUserAppRole() {
  const url = "/user/user-app-role";
  makeRequest(
    "GET",
    `${SERVER_HOST}${url}`,
    null,
    getUserParams("industry_user_admin"),
    200,
    "Fetching User App Role failed",
  );
}

export default function () {
  getUserAppRole();
}
