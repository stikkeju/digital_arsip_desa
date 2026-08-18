import { json } from '@sveltejs/kit';
import { GoogleGenAI } from '@google/genai';
import { env } from '$env/dynamic/private';

export async function POST({ request }) {
	try {
		const formData = await request.formData();
		const files = formData.getAll('files') as File[];
		const formType = formData.get('formType') as string; // 'masuk' | 'keluar'

		if (!files || files.length === 0 || !formType) {
			return json({ error: 'Data form tidak lengkap (files, formType)' }, { status: 400 });
		}

		if (!env.GEMINI_API_KEY) {
			return json({ error: 'GEMINI_API_KEY belum dikonfigurasi di .env' }, { status: 500 });
		}

		// Inisialisasi Gemini API
		const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

		// Kita HANYA memproses file PERTAMA untuk menghemat kuota request dan token
		const file = files[0];
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const base64Data = buffer.toString('base64');

		let prompt = '';
		let responseSchema = {};

		if (formType === 'masuk') {
			prompt = `Ekstrak informasi dari surat dinas ini. Carikan nomor_register (jika ada tulisan tangan/stempel agenda terima), nomor_surat, tanggal_terima (cari tanggal stempel diterima, jika tidak ada gunakan tanggal surat dibuat), asal_surat (instansi pengirim), perihal, dan keterangan (catatan/disposisi tulisan tangan jika ada). Format tanggal harus YYYY-MM-DD.`;
			responseSchema = {
				type: 'OBJECT',
				properties: {
					nomor_register: { type: 'STRING', description: 'Nomor agenda/register terima jika ada' },
					nomor_surat: { type: 'STRING', description: 'Nomor surat lengkap yang tertera' },
					tanggal_terima: { type: 'STRING', description: 'Tanggal surat dalam format YYYY-MM-DD' },
					asal_surat: { type: 'STRING', description: 'Instansi atau pihak pengirim surat' },
					perihal: { type: 'STRING', description: 'Ringkasan isi atau perihal surat' },
					keterangan: { type: 'STRING', description: 'Catatan tambahan/tulisan tangan di surat' }
				},
				required: ['nomor_surat', 'tanggal_terima', 'asal_surat', 'perihal']
			};
		} else {
			prompt = `Ekstrak informasi dari rancangan surat pemerintahan desa ini. Carikan nomor_surat, lalu pecah menjadi nomor_register (angka urut) dan nomor_index (kode klasifikasi). Carikan juga tanggal_pembuatan (format YYYY-MM-DD), perihal, tujuan instansi, dan nama_pemohon (warga yang meminta surat).`;
			responseSchema = {
				type: 'OBJECT',
				properties: {
					nomor_register: { type: 'STRING', description: 'Angka urut dari nomor_surat, misal: 1' },
					nomor_index: { type: 'STRING', description: 'Kode klasifikasi dari nomor_surat, misal: 140' },
					tanggal_pembuatan: { type: 'STRING', description: 'Tanggal pembuatan surat format YYYY-MM-DD' },
					perihal: { type: 'STRING', description: 'Maksud atau judul utama surat' },
					tujuan: { type: 'STRING', description: 'Instansi tujuan penerima surat' },
					nama_pemohon: { type: 'STRING', description: 'Nama warga yang menjadi subjek surat' }
				},
				required: ['perihal', 'tanggal_pembuatan']
			};
		}

		const response = await ai.models.generateContent({
			model: 'gemini-flash-lite-latest',
			contents: [
				prompt,
				{
					inlineData: {
						data: base64Data,
						mimeType: file.type
					}
				}
			],
			config: {
				responseMimeType: 'application/json',
				responseSchema: responseSchema,
				temperature: 0.1
			}
		});

		if (!response.text) {
			throw new Error('Tidak mendapat respon dari Gemini');
		}

		const extractedData = JSON.parse(response.text);

		return json({
			success: true,
			data: extractedData
		});
	} catch (err: any) {
		console.error('OCR API Error:', err);
		return json({ error: err.message || 'Terjadi kesalahan saat memproses OCR' }, { status: 500 });
	}
}
