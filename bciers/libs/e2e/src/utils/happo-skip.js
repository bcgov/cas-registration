// eslint-disable-next-line @typescript-eslint/no-require-imports
const jwt = require("jsonwebtoken");
// eslint-disable-next-line import/no-extraneous-dependencies, @typescript-eslint/no-require-imports
const fetch = require("node-fetch");

function makeRequest(requestAttributes, { apiKey, apiSecret }) {
  const signed = jwt.sign({ key: apiKey }, apiSecret, {
    header: { kid: apiKey },
  });

  const { url, method, json, body } = requestAttributes;

  return fetch(url, {
    method: method || "GET",
    headers: {
      Authorization: `Bearer ${signed}`,
      "Content-Type": "application/json",
    },
    body: json ? JSON.stringify(body) : body,
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response;
  });
}

const project = process.env.HAPPO_PROJECT;
// Derive project-specific credentials from the project name (e.g. "cas-registration" → "CAS_REGISTRATION")
const projectPrefix = project.replaceAll("-", "_").toUpperCase();
const apiKey = process.env[`${projectPrefix}_HAPPO_API_KEY`];
const apiSecret = process.env[`${projectPrefix}_HAPPO_API_SECRET`];
const commitSha = process.env.COMMIT_SHA;

// This helper will skip the current commit/project in happo
// https://happo.io/docs/api

async function skipHappo() {
  const response = await makeRequest(
    {
      url: `https://happo.io/api/skip/${commitSha}`,
      method: "POST",
      json: true,
      body: { project },
    },
    { apiKey, apiSecret, retryCount: 5 },
  );

  if (response.ok) {
    return response;
  }
}

// Run skipHappo() to skip the current commit in Happo.
skipHappo().then(() => console.log("Skipped Happo for this commit"));
