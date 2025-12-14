import {
	createRootRouteWithContext,
	Outlet,
	useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { AuthContextType } from "../hooks/useAuth";
import "../index.css";
import type { QueryClient } from "@tanstack/react-query";
import type { Role } from "@/stores/useOrganization";
import { motion } from "framer-motion";

interface RouterContext {
	auth: AuthContextType;
	queryClient: QueryClient;
	roles: Role[];
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: () => (
		<div className="flex">
			<Outlet />
			<TanStackRouterDevtools />
		</div>
	),
	notFoundComponent: () => {
		const navigate = useNavigate();

		return (
			<motion.div
				className="w-screen h-screen bg-[#5188EE] flex flex-col items-center justify-center text-white font-jakarta"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.5 }}
			>
				<motion.h1
					className="text-6xl font-extrabold mb-4"
					initial={{ y: -50 }}
					animate={{ y: 0 }}
					transition={{ type: "spring", stiffness: 100 }}
				>
					404
				</motion.h1>
				<motion.p
					className="text-xl mb-8"
					initial={{ y: 50 }}
					animate={{ y: 0 }}
					transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
				>
					Halaman tidak ditemukan
				</motion.p>
				<motion.button
					className="px-4 py-2 bg-white text-[#5188EE] font-semibold rounded-lg font-jakarta hover:bg-[#5188EE]/90 hover:text-white hover:shadow-none transition-colors shadow-lg cursor-pointer"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{
						type: "spring",
						stiffness: 120,
						damping: 10,
						delay: 0.4,
					}}
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.97 }}
					onClick={() => navigate({ to: "/" })}
				>
					Kembali ke Beranda
				</motion.button>
			</motion.div>
		);
	},
});
