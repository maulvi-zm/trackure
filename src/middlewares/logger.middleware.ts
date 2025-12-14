import { pinoLogger } from "hono-pino";
import pino from "pino";
import { PinoPretty } from "pino-pretty";

export function loggerMiddleware() {
	return pinoLogger({
		pino: pino(Bun.env.BUN_ENV !== "production" ? PinoPretty() : undefined),
		http: {
			reqId: () => crypto.randomUUID(),
		},
	});
}
