import { routes } from "@/lib/routes";

function getAppOrigin() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "https://level-up-deen.vercel.app";
}

function getClerkAccountsBaseUrl() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return null;
  }

  try {
    const encodedFrontendApi = publishableKey.replace(/^pk_(test|live)_/, "");
    const frontendApi = atob(encodedFrontendApi).replace(/\$$/, "");
    const accountsHost = frontendApi
      .replace(/clerk\.accountsstage\./, "accountsstage.")
      .replace(/clerk\.accounts\.|clerk\./, "accounts.");

    return `https://${accountsHost}`;
  } catch {
    return null;
  }
}

export function getHostedSignInUrl() {
  const accountsBaseUrl = getClerkAccountsBaseUrl();
  if (!accountsBaseUrl) {
    return routes.signIn;
  }

  const url = new URL("/sign-in", accountsBaseUrl);
  url.searchParams.set("redirect_url", new URL(routes.dashboard, getAppOrigin()).toString());
  return url.toString();
}

export function getHostedSignUpUrl() {
  const accountsBaseUrl = getClerkAccountsBaseUrl();
  if (!accountsBaseUrl) {
    return routes.signUp;
  }

  const url = new URL("/sign-up", accountsBaseUrl);
  url.searchParams.set("redirect_url", new URL(routes.onboarding, getAppOrigin()).toString());
  return url.toString();
}
