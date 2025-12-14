// src/routes/auth/login/index.lazy.tsx
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { useEffect } from "react";
import { loginRequest } from "../../../config/auth";
import { InteractionStatus } from "@azure/msal-browser";

// Asset Import
import Background from "../../../assets/background.png";
import WindowsIcon from "../../../assets/windows.svg";

export const Route = createLazyFileRoute("/_auth/login/")({
	component: LoginPage,
});

function LoginPage() {
	const { instance, inProgress } = useMsal();
	const navigate = useNavigate();
	const accounts = instance.getAllAccounts();
	const isAuthenticated = useIsAuthenticated();

	if (accounts.length) instance.setActiveAccount(accounts[0]);

	useEffect(() => {
		if (isAuthenticated && inProgress === InteractionStatus.None) {
			navigate({ to: "/" });
		}
	}, [isAuthenticated, inProgress, navigate]);

	const handleLogin = async () => {
		if (inProgress === InteractionStatus.None) {
			await instance.loginRedirect({
				...loginRequest,
				redirectUri: import.meta.env.VITE_REDIRECT_URL,
				prompt: "select_account",
			});
		}
	};

	return (
		<div className="flex flex-col md:flex-row w-screen h-screen overflow-hidden">
			{/* Illustrasi */}
			<div className="w-[65%]">
				<img
					src={Background}
					alt="Trackure Background"
					className="object-cover w-full h-full"
				/>
			</div>

			{/* Content */}
			<div className="w-[35%] h-full flex flex-col justify-center items-center p-12 gap-y-4">
				<h1 className="text-2xl font-bold text-color-primary text-center font-jakarta">
					Selamat Datang di Trackure!
				</h1>
				<p className="text-slate-600 text-center text-[14px] font-jakarta">
					Kelola, Pantau, dan Percepat Pengadaan Barang & Jasa dengan Sistem
					Pelacakan Transparan yang Memastikan Setiap Proses Berjalan Efisien.
				</p>
				<button
					onClick={handleLogin}
					type="button"
					className="bg-[#5188EE] hover:bg-[#5188EE]/90 text-white rounded-md text-base cursor-pointer flex items-center justify-center py-2 px-12 gap-x-4"
				>
					<img src={WindowsIcon} alt="Windows Icon" className="w-4 h-4" />
					<span>Masuk dengan Microsoft</span>
				</button>
			</div>
		</div>
	);
}
