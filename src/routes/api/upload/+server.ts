import { json } from '@sveltejs/kit';
import { google } from 'googleapis';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { env } from '$env/dynamic/private';
import { Readable } from 'stream';

const getDriveAuth = () => {
	if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REFRESH_TOKEN) {
		throw new Error('Kredensial OAuth2 (CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN) belum dikonfigurasi di .env');
	}

	const oauth2Client = new google.auth.OAuth2(
		env.GOOGLE_CLIENT_ID,
		env.GOOGLE_CLIENT_SECRET
	);

	oauth2Client.setCredentials({
		refresh_token: env.GOOGLE_REFRESH_TOKEN
	});

	return oauth2Client;
};

async function getOrCreateFolder(drive: any, parentId: string, folderName: string) {
	const res = await drive.files.list({
		q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${parentId}' in parents and trashed=false`,
		fields: 'files(id, name)',
		spaces: 'drive'
	});
	if (res.data.files && res.data.files.length > 0) {
		return res.data.files[0].id;
	}
	const createRes = await drive.files.create({
		requestBody: {
			name: folderName,
			mimeType: 'application/vnd.google-apps.folder',
			parents: [parentId]
		},
		fields: 'id'
	});
	return createRes.data.id;
}

async function processToPdf(fileBuffer: Buffer, mimeType: string): Promise<Buffer> {
	if (mimeType === 'application/pdf') {
		return fileBuffer;
	}

	let compressedImageBuffer = fileBuffer;
	if (mimeType.startsWith('image/')) {
		// Kompresi resolusi lebar maksimal 1500px dan ubah ke JPEG agar hemat size
		compressedImageBuffer = await sharp(fileBuffer)
			.resize({ width: 1500, withoutEnlargement: true })
			.jpeg({ quality: 80 })
			.toBuffer();
	} else {
		throw new Error('Format file tidak didukung. Harap unggah PDF, JPG, atau PNG.');
	}

	// Bungkus gambar ke dalam PDF
	const pdfDoc = await PDFDocument.create();
	const image = await pdfDoc.embedJpg(compressedImageBuffer);
	const page = pdfDoc.addPage([image.width, image.height]);
	page.drawImage(image, {
		x: 0,
		y: 0,
		width: image.width,
		height: image.height
	});

	const pdfBytes = await pdfDoc.save();
	return Buffer.from(pdfBytes);
}

export async function POST({ request }) {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const folderType = formData.get('folderType') as string; // 'Surat Masuk' | 'Surat Keluar'
		const tanggal = formData.get('tanggal') as string; // 'YYYY-MM-DD'
		const filename = formData.get('filename') as string;

		if (!file || !folderType || !tanggal || !filename) {
			return json({ error: 'Data form tidak lengkap (file, folderType, tanggal, filename)' }, { status: 400 });
		}

		if (!env.GOOGLE_DRIVE_FOLDER_ID) {
			return json({ error: 'GOOGLE_DRIVE_FOLDER_ID belum dikonfigurasi di .env' }, { status: 500 });
		}

		// Konversi File ke Buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// 1. Pemrosesan & Kompresi PDF
		const finalPdfBuffer = await processToPdf(buffer, file.type);

		// 2. Autentikasi Google Drive
		const auth = getDriveAuth();
		const drive = google.drive({ version: 'v3', auth });

		// 3. Pencarian/Pembuatan Hirarki Folder (Folder Utama -> Surat Masuk/Keluar -> Tahun)
		const rootId = env.GOOGLE_DRIVE_FOLDER_ID;
		const typeFolderId = await getOrCreateFolder(drive, rootId, folderType);
		const year = tanggal.split('-')[0];
		const yearFolderId = await getOrCreateFolder(drive, typeFolderId, year);

		// 4. Proses Unggah (Upload)
		const fileMetadata = {
			name: `${filename}.pdf`,
			parents: [yearFolderId]
		};

		const media = {
			mimeType: 'application/pdf',
			body: Readable.from(finalPdfBuffer)
		};

		const res = await drive.files.create({
			requestBody: fileMetadata,
			media: media,
			fields: 'id, webViewLink'
		});

		// Pastikan file bisa diakses oleh siapa saja yang memiliki link (opsional, jika root folder tidak mewarisi akses)
		await drive.permissions.create({
			fileId: res.data.id!,
			requestBody: {
				role: 'reader',
				type: 'anyone'
			}
		});

		return json({
			success: true,
			id: res.data.id,
			url: res.data.webViewLink
		});
	} catch (err: any) {
		console.error('Upload API Error:', err);
		return json({ error: err.message || 'Terjadi kesalahan internal server' }, { status: 500 });
	}
}
