import { LogLevel, BrowserCacheLocation } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID}/v2.0`,
    redirectUri: import.meta.env.VITE_REDIRECT_URL,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.SessionStorage,
    storeAuthStateInCookie: false, // Explicitly set to false to rely only on session storage
  },
  system: {
    loggerOptions: {
      loggerCallback: (
        level: LogLevel,
        message: string,
        containsPii: boolean,
      ): void => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            // console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
      piiLoggingEnabled: false,
    },
    windowHashTimeout: 60000,
    iframeHashTimeout: 6000,
    loadFrameTimeout: 0,
    asyncPopups: false,
  },
};

export const loginRequest = {
  scopes: ["user.read"],
};

export const apiRequest = {
  scopes: [
    `api://${import.meta.env.VITE_MICROSOFT_API_CLIENT_ID}/Admin.Access`,
  ],
};

export const tokenRefreshConfig = {
  refreshThreshold: 5 * 60 * 1000,
  checkInterval: 60 * 1000,
  maxSilentRetries: 3,
};