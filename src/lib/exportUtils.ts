import * as XLSX from 'xlsx';

/**
 * Konversi array of objects ke file Excel (.xlsx) dan unduh langsung.
 * @param data Array data yang sudah difilter
 * @param filename Nama file (tanpa ekstensi)
 * @param sheetName Nama sheet di dalam file Excel
 */
export function downloadExcel(data: any[], filename: string, sheetName: string = 'Laporan') {
	if (!data || data.length === 0) {
		alert('Tidak ada data untuk diekspor!');
		return;
	}

	// 1. Buat Worksheet baru dari JSON
	const worksheet = XLSX.utils.json_to_sheet(data);

	// 2. Buat Workbook baru
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

	// 3. Atur lebar kolom (Auto-fit sederhana)
	const cols = Object.keys(data[0]).map((key) => {
		// Lebar minimal 10, atau selebar header, atau selebar isi data
		const maxContentWidth = Math.max(
			key.length,
			...data.map((row) => (row[key] ? String(row[key]).length : 0))
		);
		// Batasi maksimal 50 karakter agar tidak terlalu lebar
		return { wch: Math.min(maxContentWidth + 2, 50) };
	});
	worksheet['!cols'] = cols;

	// 4. Unduh file
	XLSX.writeFile(workbook, `${filename}.xlsx`);
}
