const SuperAdminHeader = ({
	judulHalaman,
}: {
	judulHalaman: string;
}) => {
	return (
		<div className="w-full flex items-center justify-between">
			<h1 className="text-slate-900 text-xl font-bold font-jakarta">
				{judulHalaman}
			</h1>
		</div>
	);
};

export default SuperAdminHeader;
