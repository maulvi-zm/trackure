export const auth_config = {
	clientId: Bun.env.MICROSOFT_CLIENT_ID,
	clientSecret: Bun.env.MICROSOFT_CLIENT_SECRET,
	tenantId: Bun.env.MICROSOFT_TENANT_ID,
	redirectUri: Bun.env.REDIRECT_URI,
	jwtSecret: Bun.env.JWT_SECRET,
};
