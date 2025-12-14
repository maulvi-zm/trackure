import { OpenAPIHono } from "@hono/zod-openapi";
import auth from "./routes/auth.route";
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { corsMiddleware } from "./middlewares/cors.middleware";
import type { PinoLogger } from "hono-pino";
import packageJson from "../package.json";
import { swaggerUI } from "@hono/swagger-ui";
import dashboard from "./routes/dashboard.route";
import { except } from "hono/combine";
import { authMiddleware } from "./middlewares/auth.middleware";
import user_route from "./routes/user.route";
import print_number_route from "./routes/print_number.route";
import { user_activity_route } from "./routes/user_activity.route";
import { authorization_route } from "./routes/authz.route";
import { organization_route } from "./routes/organization.route";
import { item_route } from "./routes/item.route";
import { procurement_route } from "./routes/procurement.route";
import budget_route from "./routes/budget.routes";

interface AppBindings {
	Variables: {
		logger: PinoLogger;
	};
}

// Unprotected routes
const unprotectedRoutes = new OpenAPIHono<AppBindings>();
unprotectedRoutes.get("/error", (c) => {
	c.var.logger.error("Error on unprotected routes");
	throw new Error("Error on unprotected routes");
});
unprotectedRoutes.route("/auth", auth);
unprotectedRoutes.get("/", (c) => {
	return c.text("Hello Hono Development!");
});

// Swagger documentation
unprotectedRoutes.doc("/doc", {
	openapi: "3.1.0",
	info: {
		version: packageJson.version,
		title: packageJson.displayName,
		description: "API for procurement management system",
	},
	tags: [
		{ name: "auth", description: "Authentication endpoints" },
		{
			name: "protected",
			description: "Protected endpoints requiring authentication",
		},
		{ name: "dashboard", description: "Dashboard data endpoints" },
	],
});

unprotectedRoutes.get("/swagger", swaggerUI({ url: "/api/v1/public/doc" }));

// Protected routes
const protectedRoutes = new OpenAPIHono<AppBindings>();
protectedRoutes.use("/*", except("/public/*", authMiddleware));
protectedRoutes.route("/dashboard", dashboard);
protectedRoutes.route("/print-number", print_number_route);
protectedRoutes.route("/user", user_route);
protectedRoutes.route("/activity", user_activity_route);
protectedRoutes.route("/authz", authorization_route);
protectedRoutes.route("/organization", organization_route);
protectedRoutes.route("/item", item_route);
protectedRoutes.route("/procurement", procurement_route);
protectedRoutes.route("/budget", budget_route);

const app = new OpenAPIHono<AppBindings>().basePath("/api/v1");

// calling middlewares
app.use("*", corsMiddleware());
// app.use(loggerMiddleware());

// Main app routing
app.route("/public", unprotectedRoutes);
app.route("/", protectedRoutes);

Bun.serve({
	fetch: app.fetch,
	reusePort: true,
	port: Bun.env.PORT || 3000,
});
