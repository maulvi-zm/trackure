import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import { auth_config } from "@/utils/config";
import * as AuthService from "@/services/auth.service";

export class AuthController {
	private authEndpoint: string;
	private tokenEndpoint: string;
	private msGraphEndpoint: string;

	constructor() {
		this.tokenEndpoint = `https://login.microsoftonline.com/${auth_config.tenantId}/oauth2/v2.0/token`;
		this.authEndpoint = `https://login.microsoftonline.com/${auth_config.tenantId}/oauth2/v2.0/authorize`;
		this.msGraphEndpoint = "https://graph.microsoft.com/v1.0/me";
		this.getLoginUrl = this.getLoginUrl.bind(this);
		this.postCallback = this.postCallback.bind(this);
	}

	async getLoginUrl(c: Context) {
		try {
			const authUrl = AuthService.getAuthUrl(c, this.authEndpoint);
			return c.json({ loginUrl: authUrl.toString() }, 200);
		} catch (error) {
			if (error instanceof Error) {
				return c.json(
					{
						message: "Study kit fetch failed!",
						error: error.message,
					},
					500,
				);
			}
			throw error;
		}
	}

	async postCallback(c: Context) {
		const { code, state } = await c.req.json();
		const storedState = getCookie(c, "auth_state");

		// Validate state to prevent CSRF attacks
		if (!code || !state || state !== storedState) {
			return c.json({ error: "Invalid state parameter" }, 400);
		}

		try {
			const success = await AuthService.postCallback(
				c,
				code,
				this.tokenEndpoint,
				this.msGraphEndpoint,
			);
			return c.json({ success: true }, 200);
		} catch (error) {
			console.error("Authentication error:", error);
			return c.json({ error: "Authentication failed" }, 500);
		}
	}
}
