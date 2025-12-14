// CSS Import
import "./index.css";
// Azure Import
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// TanStack Import
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
// Library Import
import { StrictMode } from "react";
import { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { configureAxios } from "./lib/axios.ts";
// Config Import
import { msalConfig } from "./config/auth.ts";
// Hooks Import
import { AuthProvider, useAuth } from "./hooks/useAuth.tsx";
import { routeTree } from "./routeTree.gen";
import { useOrganizationStore } from "./stores/useOrganization.ts";
import { Toaster } from "./components/ui/sonner.tsx";

const msalInstance = new PublicClientApplication(msalConfig);
const queryClient = new QueryClient();

function AppWithRouter() {
	const roles = useOrganizationStore((state) => state.roles);
	const isLoadingRole = useOrganizationStore((state) => state.isLoading);
	const fetchOrganizations = useOrganizationStore(
		(state) => state.fetchOrganizations,
	);
	const fetchActiveOrganization = useOrganizationStore(
		(state) => state.fetchActiveOrganization,
	);

	const fetchRoles = useOrganizationStore((state) => state.fetchRoles);

	const auth = useAuth();
	useEffect(() => {
		if (auth.isAuthenticated) {
			configureAxios(auth);
			fetchOrganizations();
			fetchActiveOrganization();
			fetchRoles();
		}
	}, [auth, fetchOrganizations, fetchActiveOrganization, fetchRoles]);

	const router = createRouter({
		routeTree,
		context: {
			auth,
			queryClient,
			roles: roles,
		},
	});

	if (auth.isLoading || isLoadingRole) {
		return (
			<div className="h-screen w-screen bg-[#5188EE] flex items-center justify-center flex-col gap-4">
				<h1 className="text-white text-xl font-semibold">
					Loading Authentication...
				</h1>
				<div className="flex gap-2">
					{[0, 1, 2].map((i) => (
						<motion.div
							key={i}
							className="w-3 h-3 bg-white rounded-full"
							animate={{ y: [0, -10, 0] }}
							transition={{
								duration: 0.8,
								repeat: Number.POSITIVE_INFINITY,
								delay: i * 0.2,
							}}
						/>
					))}
				</div>
			</div>
		);
	}

	return <RouterProvider router={router} context={{ auth, queryClient }} />;
}

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<MsalProvider instance={msalInstance}>
				<AuthProvider>
					<QueryClientProvider client={queryClient}>
						<AppWithRouter />
						<Toaster />
					</QueryClientProvider>
				</AuthProvider>
			</MsalProvider>
		</StrictMode>,
	);
}
