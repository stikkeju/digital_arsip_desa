import { json } from '@sveltejs/kit';
import { google } from 'googleapis';
import { env } from '$env/dynamic/private';

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

export async function POST({ request }) {
	try {
		const { file_url } = await request.json();

		if (!file_url) {
			return json({ error: 'Data tidak lengkap (file_url)' }, { status: 400 });
		}

		// Extract file ID from URL
		// Format URL Google Drive biasanya: https://drive.google.com/file/d/1XyZ.../view
		const match = file_url.match(/\/d\/([a-zA-Z0-9_-]+)/);
		if (!match || !match[1]) {
			return json({ error: 'Tautan Google Drive tidak valid atau tidak memiliki ID file.' }, { status: 400 });
		}
		
		const fileId = match[1];

		// Autentikasi Google Drive
		const auth = getDriveAuth();
		const drive = google.drive({ version: 'v3', auth });

		// Hapus file dari Drive
		await drive.files.delete({ fileId });

		return json({ success: true });
	} catch (err: any) {
		console.error('Delete API Error:', err);
		// Jika file sudah tidak ada di Drive (404), kita anggap sukses saja karena tujuannya memang menghapus
		if (err.code === 404 || (err.message && err.message.includes('File not found'))) {
			return json({ success: true, note: 'File sudah tidak ditemukan di Drive' });
		}
		return json({ error: err.message || 'Terjadi kesalahan internal server' }, { status: 500 });
	}
}
