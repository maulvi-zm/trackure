import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_auth/auth-response/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <AuthResponseHandler />;
}

const AuthResponseHandler = () => {
	const { instance } = useMsal();
	const navigate = useNavigate();

	useEffect(() => {
		instance
			.handleRedirectPromise()
			.then((response) => {
				if (response) {
					console.log("Login successful", response);
					navigate({ to: "/" });
				}
			})
			.catch((error) => {
				console.error("Error during authentication redirect:", error);
				navigate({ to: "/login" });
			});
	}, [instance, navigate]);

	return (
		<div className="h-screen w-screen bg-[#5188EE]">
			Processing authentication...
		</div>
	);
};

export default AuthResponseHandler;
