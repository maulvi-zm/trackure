import type { ReactNode } from "@tanstack/react-router";

const Wrapper = ({
	children,
}: {
	children: ReactNode;
}) => {
	return (
		<div className="bg-[#E8F0FF] p-4 h-screen w-full">
			<div className="w-full h-full shadow-md bg-white rounded-[12px] p-4 font-jakarta">
				{children}
			</div>
		</div>
	);
};

export default Wrapper;
