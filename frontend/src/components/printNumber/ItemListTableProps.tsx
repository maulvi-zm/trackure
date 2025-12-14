import type React from "react";

interface DummyItem {
	id: string;
	itemName: string;
	itemCode: string;
	category: string;
	quantity: number;
	unit: string;
}

interface ItemListTableProps {
	items: DummyItem[] | undefined;
}

const ItemListTable: React.FC<ItemListTableProps> = ({ items }) => {
	return (
		<div className="mt-4">
			<h4 className="font-medium text-lg mb-2">Daftar Barang</h4>
			<div className="border rounded-md overflow-x-auto max-h-60">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50 sticky top-0">
						<tr>
							<th
								scope="col"
								className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Kode
							</th>
							<th
								scope="col"
								className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Nama Barang
							</th>
							<th
								scope="col"
								className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Kategori
							</th>
							<th
								scope="col"
								className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Qty
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{items &&
							items.map((item) => (
								<tr key={item.id} className="hover:bg-gray-50">
									<td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
										{item.itemCode}
									</td>
									<td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
										{item.itemName}
									</td>
									<td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
										{item.category}
									</td>
									<td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
										{item.quantity} {item.unit}
									</td>
								</tr>
							))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default ItemListTable;
