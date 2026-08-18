import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ui } from '$lib/stores/ui.svelte';

/**
 * Konversi array of objects ke file Excel (.xlsx) dan unduh langsung.
 */
export function downloadExcel(data: any[], filename: string, sheetName: string = 'Laporan') {
	if (!data || data.length === 0) {
		ui.addToast('Tidak ada data untuk diekspor!', 'warning');
		return;
	}

	const worksheet = XLSX.utils.json_to_sheet(data);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

	const cols = Object.keys(data[0]).map((key) => {
		const maxContentWidth = Math.max(
			key.length,
			...data.map((row) => (row[key] ? String(row[key]).length : 0))
		);
		return { wch: Math.min(maxContentWidth + 2, 50) };
	});
	worksheet['!cols'] = cols;

	XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Konversi data ke PDF (A4 Portrait) dengan Kop Surat dan unduh langsung.
 */
export async function downloadPDF(title: string, periode: string, columns: {header: string, dataKey: string}[], rawData: any[], filename: string) {
	if (!rawData || rawData.length === 0) {
		ui.addToast('Tidak ada data untuk diekspor!', 'warning');
		return;
	}

	// 1. Inisiasi jsPDF (A4, Portrait, millimeters)
	const doc = new jsPDF({
		orientation: 'portrait',
		unit: 'mm',
		format: 'a4'
	});

	// 2. Fungsi pembantu untuk memuat gambar logo
	const loadLogo = async (url: string): Promise<HTMLImageElement> => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.src = url;
			img.crossOrigin = 'Anonymous';
			img.onload = () => resolve(img);
			img.onerror = (e) => reject(e);
		});
	};

	try {
		// Menggambar Kop Surat
		const logo = await loadLogo('/logo-tangerang.png');
		// Add Image: (image, format, x, y, width, height)
		doc.addImage(logo, 'PNG', 15, 10, 22, 28); 
		
		doc.setFont('times', 'bold');
		doc.setFontSize(14);
		doc.text('PEMERINTAH KABUPATEN TANGERANG', 105, 15, { align: 'center' });
		doc.setFontSize(13);
		doc.text('KECAMATAN MEKAR BARU', 105, 21, { align: 'center' });
		doc.setFontSize(16);
		doc.text('KANTOR DESA KLUTUK', 105, 28, { align: 'center' });
		
		doc.setFont('times', 'normal');
		doc.setFontSize(10);
		doc.text('Jl. KH. Suhaemi Ds. Klutuk Kec. Mekar Baru Kab. Tangerang 15550', 105, 34, { align: 'center' });

		// Garis bawah kop (Double line effect)
		doc.setLineWidth(1.0);
		doc.line(15, 40, 195, 40);
		doc.setLineWidth(0.3);
		doc.line(15, 41.5, 195, 41.5);

		// Judul Laporan
		doc.setFont('helvetica', 'bold');
		doc.setFontSize(12);
		doc.text(title, 105, 52, { align: 'center' });
		doc.setLineWidth(0.5);
		// Underline title
		const titleWidth = doc.getTextWidth(title);
		doc.line(105 - (titleWidth / 2), 53, 105 + (titleWidth / 2), 53);

		doc.setFont('helvetica', 'normal');
		doc.setFontSize(10);
		doc.text(`Periode: ${periode}`, 105, 58, { align: 'center' });

		// Tabel Data
		const headers = ['No', ...columns.map(c => c.header)];
		const body = rawData.map((row, idx) => {
			const rowData = [String(idx + 1)];
			columns.forEach(c => rowData.push(String(row[c.dataKey] || '-')));
			return rowData;
		});

		autoTable(doc, {
			startY: 65,
			head: [headers],
			body: body,
			theme: 'grid',
			styles: {
				font: 'helvetica',
				fontSize: 8,
				cellPadding: 3,
				textColor: [0, 0, 0],
				lineColor: [0, 0, 0],
				lineWidth: 0.1,
			},
			headStyles: {
				fillColor: [230, 230, 230],
				textColor: [0, 0, 0],
				fontStyle: 'bold',
				halign: 'center',
			},
			columnStyles: {
				0: { halign: 'center', cellWidth: 10 }, // Kolom No
			},
			margin: { left: 15, right: 15 },
			didDrawPage: function (data: any) {
				// KKM Footer on every page
				const str = "Di-generate oleh Sistem Informasi Arsip Digital - Karya Tim KKM 96 Uniba 2026";
				doc.setFontSize(8);
				doc.setFont('helvetica', 'italic');
				doc.setTextColor(150, 150, 150);
				doc.text(str, 15, doc.internal.pageSize.height - 10);
				doc.setTextColor(0, 0, 0); // reset
			}
		});

		// Calculate Y position after table
		const finalY = (doc as any).lastAutoTable.finalY || 65;

		// Tanda Tangan
		if (finalY + 40 < 280) { // Jika masih cukup di halaman yang sama
			doc.setFont('times', 'normal');
			doc.setFontSize(11);
			doc.text('Mengetahui,', 150, finalY + 15);
			doc.setFont('times', 'bold');
			doc.text('Kepala Desa Klutuk', 150, finalY + 20);
			doc.text('_______________________', 150, finalY + 45);
		}

		// Simpan PDF
		doc.save(`${filename}.pdf`);
	} catch (err) {
		console.error("Error generating PDF:", err);
		ui.addToast("Terjadi kesalahan saat membuat PDF. Pastikan logo dapat diakses.", 'error');
	}
}
