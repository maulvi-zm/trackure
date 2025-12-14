import { cors } from "hono/cors";

if (Bun.env.BUN_ENV === "production" && !Bun.env.CLIENT_URL) {
	throw new Error("CLIENT_URL environment variable is required in production");
}

export function corsMiddleware() {
	return cors({
		// biome-ignore lint/style/noNonNullAssertion: This is a valid use case for non-null assertion
		origin: Bun.env.BUN_ENV === "production" ? [Bun.env.CLIENT_URL!] : "*",
		credentials: true,
		allowMethods: ["GET", "POST", "DELETE", "OPTIONS", "PATCH", "PUT"],
		allowHeaders: [
			"Content-Type",
			"Authorization",
			"x-requested-with",
			"Accept",
			"user-agent",
			"referer",
			"cache-control",
		],
		exposeHeaders: ["Content-Length"],
	});
}
