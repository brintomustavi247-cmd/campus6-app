const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

export const getAppBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_APP_URL;
  if (envUrl && typeof envUrl === "string") {
    return trimTrailingSlashes(envUrl);
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return trimTrailingSlashes(window.location.origin);
  }

  return "http://localhost:3000";
};