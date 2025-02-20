/* eslint-disable */
import http from "k6/http";
import { check } from "k6";
import { crypto } from "k6/experimental/webcrypto";
import { industryUserParams } from "../../setup/params.js";

const user = () => {
  const HOST = __ENV.SERVER_HOST;

  const endpoints = [
    {
      method: "get",
      url: "/user/user-app-role",
      params: industryUserParams,
    },
    {
      method: "post",
      url: "/users",
      params: {
        headers: {
          "Content-Type": "application/json",
          Authorization: JSON.stringify({ user_guid: crypto.randomUUID() }),
        },
      },
      body: JSON.stringify({
        identity_provider: "bceidbusiness",
        first_name: "Test",
        last_name: "User",
        position_title: "Test Position",
        email: "test.user@test.com",
        phone_number: "+12345678901",
        business_guid: "12345678-1234-1234-1234-123456789012",
        bceid_business_name: "Test Business",
      }),
    },
  ];

  endpoints.forEach(({ method, url, params, body }) => {
    const response = http[method](
      HOST + url,
      body || params,
      body ? params : undefined,
    );
    check(response, { "is status 200": (r) => r.status === 200 });
  });
};

export default user;
