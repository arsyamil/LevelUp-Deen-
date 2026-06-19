const assert = require("node:assert/strict");

function getArg(name, fallback) {
  const prefix = `${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

function joinUrl(base, path) {
  return new URL(path, base.endsWith("/") ? base : `${base}/`).toString();
}

async function readText(response) {
  return response.text();
}

async function readJson(response) {
  return response.json();
}

async function fetchWithManualRedirect(url) {
  return fetch(url, { redirect: "manual" });
}

async function expectStatus(url, expectedStatus, parser = readText) {
  const response = await fetchWithManualRedirect(url);
  assert.equal(response.status, expectedStatus, `${url} returned ${response.status}`);
  return { response, body: await parser(response) };
}

async function main() {
  const baseUrl = getArg("--base", "http://localhost:3000");
  const apiBaseUrl = getArg("--api-base", baseUrl);

  const checks = [
    async () => {
      const { body } = await expectStatus(joinUrl(baseUrl, "/login"), 200);
      assert.match(body, /<h1[^>]*>Login<\/h1>/, "login page must render Login heading");
      assert.match(body, /Level Up Deen/, "login page must include app title");
      return "login page";
    },
    async () => {
      const { body } = await expectStatus(joinUrl(baseUrl, "/register"), 200);
      assert.match(body, /Daftar|Register/i, "register page must render registration copy");
      return "register page";
    },
    async () => {
      const { body } = await expectStatus(joinUrl(apiBaseUrl, "/api/health"), 200, readJson);
      assert.equal(body.ok, true, "health response must be ok");
      assert.equal(body.service, "level-up-deen", "health response must identify service");
      return "api health";
    },
    async () => {
      const { body } = await expectStatus(joinUrl(baseUrl, "/manifest.webmanifest"), 200, readJson);
      assert.equal(body.name, "Level Up Deen", "manifest must identify the app");
      return "manifest";
    },
    async () => {
      const response = await fetchWithManualRedirect(joinUrl(baseUrl, "/dashboard"));
      assert.equal(response.status, 307, "dashboard must redirect anonymous users");
      assert.equal(
        response.headers.get("location"),
        "/login?redirect=%2Fdashboard",
        "dashboard redirect target must preserve return path"
      );
      return "auth redirect";
    },
    async () => {
      const response = await fetchWithManualRedirect(joinUrl(baseUrl, "/onboarding"));
      assert.equal(response.status, 307, "onboarding must redirect anonymous users");
      assert.equal(response.headers.get("location"), "/login", "onboarding must send anonymous users to login");
      return "onboarding redirect";
    },
  ];

  for (const check of checks) {
    const label = await check();
    console.log(`ok - ${label}`);
  }

  console.log(`Smoke checks passed for ${baseUrl}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
