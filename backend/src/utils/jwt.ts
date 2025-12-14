import type { JWTPayload } from "jose";

// Cache JWKS to avoid frequent fetches
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
let jwksCache: any = null;
let jwksCacheTime = 0;

// Fetch JWKS from Microsoft Entra ID
async function fetchJwks() {
	const now = Date.now();
	// Cache for 24 hours
	if (jwksCache && now - jwksCacheTime < 24 * 60 * 60 * 1000) {
		return jwksCache;
	}

	const tenant = Bun.env.MICROSOFT_TENANT_ID;
	const response = await fetch(
		`https://login.microsoftonline.com/${tenant}/discovery/v2.0/keys`,
	);
	jwksCache = await response.json();
	jwksCacheTime = now;
	return jwksCache;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
async function verifyToken(token: string, jwks: any): Promise<JWTPayload> {
	const base64Url = token.split(".")[1];
	const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
	const jsonPayload = decodeURIComponent(
		atob(base64)
			.split("")
			.map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
			.join(""),
	);

	return JSON.parse(jsonPayload);
}
