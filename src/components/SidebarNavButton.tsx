import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Link } from "@tanstack/react-router";

const SidebarNavButton = ({
	isOpen,
	icon,
	label,
	route,
}: {
	isOpen: boolean;
	icon: string;
	label: string;
	route: string;
}) => {
	return (
		<Link to={route} className="w-full">
			<Button
				variant={"ghost"}
				className={cn(
					"flex w-full items-center hover:bg-white/10 transition-all duration-600 cursor-pointer",
					isOpen ? "justify-start gap-x-4" : "justify-center p-0",
				)}
			>
				<img src={icon} alt="Icon" className="h-5 w-5" />
				{isOpen && (
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="text-white font-jakarta"
					>
						{label}
					</motion.p>
				)}
			</Button>
		</Link>
	);
};

export default SidebarNavButton;
