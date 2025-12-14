import { toast } from "sonner";

type ToastOptions = {
	description?: string;
	action?: {
		label: string;
		onClick: () => void;
	};
};

export function useToast() {
	const showToast = (message: string, options?: ToastOptions) => {
		toast(message, options);
	};

	const success = (message: string, options?: ToastOptions) => {
		toast.success(message, options);
	};

	const error = (message: string, options?: ToastOptions) => {
		toast.error(message, options);
	};

	const warning = (message: string, options?: ToastOptions) => {
		toast.warning(message, options);
	};

	const info = (message: string, options?: ToastOptions) => {
		toast.info(message, options);
	};

	const loading = (message: string, options?: ToastOptions) => {
		return toast.loading(message, options);
	};

	const dismiss = (toastId?: string) => {
		if (toastId) {
			toast.dismiss(toastId);
		} else {
			toast.dismiss();
		}
	};

	return {
		showToast,
		success,
		error,
		warning,
		info,
		loading,
		dismiss,
	};
}
