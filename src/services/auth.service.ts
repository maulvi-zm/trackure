import { setCookie } from "hono/cookie";
import * as crypto from "node:crypto";
import { auth_config } from "@/utils/config";
import type { Context } from "hono";
import * as jose from "jose";

export async function getAuthUrl(c: Context, authEndpoint: string) {
	// Generate a random state parameter for CSRF protection
	const state = crypto.randomUUID();

	// Store state in a cookie to verify when callback occurs
	setCookie(c, "auth_state", state, {
		httpOnly: true,
		secure: Bun.env.BUN_ENV === "production",
		maxAge: 60 * 10, // 10 minutes
		path: "/",
		sameSite: "lax",
	});

	// Construct the authorization URL
	const authUrl = new URL(authEndpoint);
	authUrl.searchParams.append("client_id", auth_config.clientId as string);
	authUrl.searchParams.append("response_type", "code");
	authUrl.searchParams.append(
		"redirect_uri",
		auth_config.redirectUri as string,
	);
	authUrl.searchParams.append("scope", "openid profile email User.Read");
	authUrl.searchParams.append("state", state);
	// Optional: Adding response_mode=query will ensure params come back in query string
	authUrl.searchParams.append("response_mode", "query");
}

export async function postCallback(
	c: Context,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	code: any,
	tokenEndpoint: string,
	msGraphEndpoint: string,
) {
	// Exchange authorization code for access token
	const tokenResponse = await fetch(tokenEndpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			client_id: auth_config.clientId as string,
			client_secret: auth_config.clientSecret as string,
			code,
			redirect_uri: auth_config.redirectUri as string,
			grant_type: "authorization_code",
		}),
	});

	const tokenData = await tokenResponse.json();

	if (!tokenResponse.ok) {
		console.error("Token exchange failed:", tokenData);
		return c.json({ error: "Failed to exchange code for token" }, 500);
	}

	// Decode the ID token to verify organizational membership
	const idToken = tokenData.id_token;
	const decodedToken = jose.decodeJwt(idToken);

	// Check if user belongs to your organization
	if (decodedToken.tid !== auth_config.tenantId) {
		return c.json({ error: "User is not a member of the organization" }, 403);
	}

	// Get additional user information from Microsoft Graph API
	const userResponse = await fetch(msGraphEndpoint, {
		headers: {
			Authorization: `Bearer ${tokenData.access_token}`,
		},
	});

	const userData = await userResponse.json();

	// Create a session token using JWT
	const sessionToken = await new jose.SignJWT({
		sub: userData.id,
		email: userData.mail || userData.userPrincipalName,
		name: userData.displayName,
		organizationId: decodedToken.tid,
		// Optionally store group memberships or roles here
	})
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("1h")
		.sign(new TextEncoder().encode(auth_config.jwtSecret));

	// Set the session token as a cookie
	setCookie(c, "session_token", sessionToken, {
		httpOnly: true,
		secure: Bun.env.BUN_ENV === "production",
		maxAge: 60 * 60, // 1 hour
		path: "/",
		sameSite: "lax",
	});

	// Clear the state cookie
	setCookie(c, "auth_state", "", {
		maxAge: 0,
		path: "/",
	});
}
