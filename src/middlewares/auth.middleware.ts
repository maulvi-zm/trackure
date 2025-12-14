import { getActiveUserByEmail } from "@/services/user.service";
import type { Context, Next } from "hono";
import { jwtVerify, importSPKI } from "jose";
import { JwksClient } from "jwks-rsa";

const client = new JwksClient({
	jwksUri: "https://login.microsoftonline.com/common/discovery/keys",
	cache: true,
	cacheMaxAge: 86400000, // 24 hours in ms
	rateLimit: true,
	jwksRequestsPerMinute: 10,
	timeout: 5000,
});

export const validateToken = async (token: string) => {
	if (!token || token === "undefined" || token === "null") {
		console.log("Invalid token value provided:", token);
		return null;
	}

	try {
		const timeoutPromise = new Promise((_, reject) => {
			setTimeout(
				() => reject(new Error("Token validation timed out after 5 seconds")),
				5000,
			);
		});

		const verifyPromise = jwtVerify(
			token,
			async (header) => {
				if (!header.kid) {
					throw new Error("Token header missing kid (key ID)");
				}

				console.log("Fetching signing key for kid:", header.kid);
				try {
					const key = await client.getSigningKey(header.kid);
					console.log("Signing key retrieved successfully");
					const publicKey = key.getPublicKey();

					const cryptoKey = await importSPKI(publicKey, "RS256");
					console.log("Public key converted to CryptoKey");

					return cryptoKey;
				} catch (keyError) {
					console.error("Error fetching signing key:", keyError);
					throw keyError;
				}
			},
			{
				issuer: `https://sts.windows.net/${Bun.env.MICROSOFT_TENANT_ID}/`,
				audience: `api://${Bun.env.MICROSOFT_CLIENT_ID}`,
				maxTokenAge: "1h",
			},
		);

		// Race the verification against the timeout
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const decodedToken: any = await Promise.race([
			verifyPromise,
			timeoutPromise,
		]);
		console.log("Token validated successfully");

		return decodedToken.payload;
	} catch (error) {
		console.error(
			"Token validation failed:",
			`api://${Bun.env.MICROSOFT_CLIENT_ID}`,
		);
		return null;
	}
};

export const authMiddleware = async (c: Context, next: Next) => {
	if (c.req.method === "OPTIONS") {
		await next();
		return;
	}

	const authHeader = c.req.header("Authorization");

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		console.log("Missing or invalid Authorization header");
		return c.json({ error: "Unauthorized - Missing or invalid token" }, 401);
	}

	const token = authHeader.split(" ")[1];

	// Check if token is undefined or null (as a string)
	if (token === "undefined" || token === "null") {
		console.log("Token is literally 'undefined' or 'null'");
		return c.json({ error: "Unauthorized - No valid token provided" }, 401);
	}

	// Validate token with timeout
	const tokenValidationPromise = validateToken(token);
	const timeoutPromise = new Promise<null>((resolve) => {
		setTimeout(() => {
			console.error("Auth middleware timed out");
			resolve(null);
		}, 8000); // Slightly longer than the validate function timeout
	});

	const payload = await Promise.race([tokenValidationPromise, timeoutPromise]);

	if (!payload) {
		console.log("Token validation failed or timed out");
		return c.json({ error: "Unauthorized - Invalid token" }, 401);
	}

	// Extract user information from payload
	const rawUser = {
		id: payload.oid || payload.sub,
		name: payload.name,
		email: payload.preferred_username || payload.email || payload.upn,
	};

	const user = await getActiveUserByEmail(rawUser.email);

	if (!user) return c.json({ error: "Forbidden Access" }, 403);

	c.set("user", user);

	await next();
};
