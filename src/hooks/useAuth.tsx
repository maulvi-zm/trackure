import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { AccountInfo } from "@azure/msal-browser";
import { redirect } from "@tanstack/react-router";
import { apiRequest, loginRequest, tokenRefreshConfig } from "../config/auth";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import type { SilentRequest } from "@azure/msal-browser";

export interface UserProfile {
  displayName?: string;
  givenName?: string;
  surname?: string;
  email?: string;
  userPrincipalName?: string;
  id?: string;
  jobTitle?: string;
  mobilePhone?: string;
  officeLocation?: string;
  preferredLanguage?: string;
  photo?: string; // Base64 encoded photo or URL
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: AccountInfo | null;
  userProfile: UserProfile | null; // Added user profile
  login: () => Promise<void>;
  clearSessionStorage: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  refreshToken: () => Promise<string | null>;
  isLoading: boolean;
  fetchUserProfile: () => Promise<UserProfile | null>; // Added method to fetch profile
}

interface TokenInfo {
  token: string;
  expiresAt: number; // timestamp when token expires
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AccountInfo | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // Added user profile state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const silentRequestAttempts = useRef(0);
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const getActiveAccount = useCallback(() => {
    return instance.getActiveAccount();
  }, [instance]);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      await instance.initialize();

      try {
        const result = await instance.handleRedirectPromise();
        if (result) {
          instance.setActiveAccount(result.account);
          setUser(result.account);
        } else {
          const accounts = instance.getAllAccounts();
          if (accounts.length > 0) {
            instance.setActiveAccount(accounts[0]);
            setUser(accounts[0]);
          }
        }

        if (instance.getActiveAccount()) {
          await acquireNewToken();
          
          const profile = await fetchUserProfile();
          if (profile) {
            setUserProfile(profile);
          }
        }
      } catch (error) {
        console.error("Error during authentication initialization:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [instance]);

  const acquireNewToken = useCallback(async (): Promise<string | null> => {
    const account = getActiveAccount();

    if (!account) {
      console.warn("No active account when acquiring token");
      return null;
    }

    silentRequestAttempts.current = 0;

    const attemptSilentAcquisition = async (): Promise<string | null> => {
      try {
        const tokenResponse = await instance.acquireTokenSilent({
          ...apiRequest,
          account: account,
          authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID}/v2.0`,
          forceRefresh: silentRequestAttempts.current > 0, // Force refresh on retry
        } as SilentRequest);

        const expiresAt = tokenResponse.expiresOn
          ? tokenResponse.expiresOn.getTime() -
            tokenRefreshConfig.refreshThreshold
          : Date.now() + 3500 * 1000; // Default to just under 1 hour if no expiration

        const newTokenInfo = {
          token: tokenResponse.accessToken,
          expiresAt: expiresAt,
        };

        setTokenInfo(newTokenInfo);
        silentRequestAttempts.current = 0; // Reset counter on success

        return tokenResponse.accessToken;
      } catch (error) {
        console.error(
          `Silent token acquisition attempt ${silentRequestAttempts.current + 1} failed:`,
          error,
        );
        silentRequestAttempts.current++;

        if (
          silentRequestAttempts.current < tokenRefreshConfig.maxSilentRetries
        ) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return attemptSilentAcquisition();
        }

        return null;
      }
    };

    const token = await attemptSilentAcquisition();
    if (token) return token;

    try {
      console.log("Attempting interactive token acquisition...");
      const tokenResponse = await instance.acquireTokenPopup({
        ...apiRequest,
        account: account,
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID}/v2.0`,
      });

      const expiresAt = tokenResponse.expiresOn
        ? tokenResponse.expiresOn.getTime() -
          tokenRefreshConfig.refreshThreshold
        : Date.now() + 3500 * 1000;

      const newTokenInfo = {
        token: tokenResponse.accessToken,
        expiresAt: expiresAt,
      };

      setTokenInfo(newTokenInfo);
      return tokenResponse.accessToken;
    } catch (interactiveError) {
      console.error("Interactive token acquisition failed", interactiveError);
      return null;
    }
  }, [getActiveAccount, instance]);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    console.log("Refreshing access token...");
    return acquireNewToken();
  }, [acquireNewToken]);

  const login = async (): Promise<void> => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const clearSessionStorage = async (): Promise<void> => {
    sessionStorage.clear();
  };

  const logout = async (): Promise<void> => {
    try {
      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin,
      });
      setUser(null);
      setUserProfile(null); // Clear profile on logout
      setTokenInfo(null);
      redirect({ to: "/" });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const account = getActiveAccount();

    if (!account) {
      console.warn("No active account when requesting token");
      return null;
    }

    if (tokenInfo?.token && tokenInfo.expiresAt > Date.now()) {
      return tokenInfo.token;
    }

    return refreshToken();
  }, [getActiveAccount, tokenInfo, refreshToken]);

  const getGraphToken = useCallback(async (): Promise<string | null> => {
    const account = getActiveAccount();

    if (!account) {
      console.warn("No active account when requesting Graph token");
      return null;
    }

    try {
      const graphRequest = {
        scopes: ["User.Read", "User.ReadBasic.All"],
        account: account,
      };

      const tokenResponse = await instance.acquireTokenSilent(graphRequest);
      return tokenResponse.accessToken;
    } catch (error) {
      console.error("Failed to get Graph token silently, trying popup", error);
      
      try {
        const tokenResponse = await instance.acquireTokenPopup({
          scopes: ["User.Read", "User.ReadBasic.All"],
          account: account,
        });
        return tokenResponse.accessToken;
      } catch (popupError) {
        console.error("Failed to get Graph token with popup", popupError);
        return null;
      }
    }
  }, [getActiveAccount, instance]);

  const fetchUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const graphToken = await getGraphToken();
      
      if (!graphToken) {
        console.error("Could not get Graph token");
        return null;
      }

      const response = await fetch(
        "https://graph.microsoft.com/v1.0/me",
        {
          headers: {
            Authorization: `Bearer ${graphToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Graph API returned ${response.status}`);
      }

      const data = await response.json();
      
      const profile: UserProfile = {
        displayName: data.displayName,
        givenName: data.givenName,
        surname: data.surname,
        email: data.mail || data.userPrincipalName,
        userPrincipalName: data.userPrincipalName,
        id: data.id,
        jobTitle: data.jobTitle,
        mobilePhone: data.mobilePhone,
        officeLocation: data.officeLocation,
        preferredLanguage: data.preferredLanguage,
      };

      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }, [getGraphToken]);

  const fetchUserPhoto = useCallback(async (): Promise<string | null> => {
    try {
      const graphToken = await getGraphToken();
      
      if (!graphToken) {
        return null;
      }

      const response = await fetch(
        "https://graph.microsoft.com/v1.0/me/photo/$value",
        {
          headers: {
            Authorization: `Bearer ${graphToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.log("User has no profile photo");
          return null;
        }
        throw new Error(`Graph API returned ${response.status}`);
      }

      const blob = await response.blob();
      const photoUrl = URL.createObjectURL(blob);
      
      setUserProfile(prev => prev ? { ...prev, photo: photoUrl } : null);
      
      return photoUrl;
    } catch (error) {
      console.error("Error fetching user photo:", error);
      return null;
    }
  }, [getGraphToken]);

  useEffect(() => {
    if (!isAuthenticated || !getActiveAccount()) {
      return;
    }
    const intervalId = setInterval(async () => {
      if (!tokenInfo) {
        await acquireNewToken();
        return;
      }

      const timeUntilExpiry = tokenInfo.expiresAt - Date.now();
      
      if (timeUntilExpiry < 10 * 60 * 1000) {
        console.log(`Token expires in ${Math.floor(timeUntilExpiry / 1000)} seconds`);
      }

			if (
				tokenInfo.expiresAt <=
				Date.now() + tokenRefreshConfig.refreshThreshold
			) {
				console.log("Token expiring soon, refreshing...");
				await refreshToken();
			}
		}, tokenRefreshConfig.checkInterval);

    return () => clearInterval(intervalId);
  }, [
    isAuthenticated,
    getActiveAccount,
    tokenInfo,
    refreshToken,
    acquireNewToken,
  ]);

  useEffect(() => {
    if (user && !userProfile) {
      fetchUserProfile().then(profile => {
        if (profile) {
          fetchUserPhoto();
        }
      });
    }
  }, [user, userProfile, fetchUserProfile, fetchUserPhoto]);

  const contextValue: AuthContextType = {
    clearSessionStorage,
    isAuthenticated,
    user,
    userProfile, // Added to context
    login,
    logout,
    getAccessToken,
    refreshToken,
    isLoading,
    fetchUserProfile, // Added to context
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthGuard: React.FC<AuthProviderProps> = ({ children }) => {
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      login();
    }
  }, [isAuthenticated, isLoading, login]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : null;
};