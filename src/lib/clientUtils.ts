import imageCompression from 'browser-image-compression';

/**
 * Compresses an array of File objects if they are images.
 * Non-image files (like PDFs) are returned exactly as they are.
 * 
 * @param files Array of files to process
 * @returns Promise that resolves to an array of compressed files
 */
export async function compressImageFiles(files: File[]): Promise<File[]> {
    // Dinamis: Targetkan total ukuran semua gambar maksimal ~3MB agar sangat aman untuk Vercel (Limit 4.5MB).
    // Misal: 1 gambar = 3MB. Jika 5 gambar = 0.6MB per gambar. (Minimal 0.3MB agar masih bisa dibaca).
    const dynamicMaxSizeMB = Math.max(0.3, 3 / files.length);

    const options = {
        maxSizeMB: dynamicMaxSizeMB, 
        maxWidthOrHeight: 1500,   // Resolusi lebar 1500px sudah sangat tajam untuk kertas A4/dokumen
        useWebWorker: true,
        alwaysKeepResolution: false
    };

    const compressedFiles: File[] = [];

    for (const file of files) {
        if (file.type.startsWith('image/')) {
            try {
                // Compress gambar menggunakan konfigurasi di atas
                const compressedBlob = await imageCompression(file, options);
                
                // Konversi kembali dari Blob ke File
                const compressedFile = new File([compressedBlob], file.name, {
                    type: compressedBlob.type,
                    lastModified: Date.now()
                });
                
                compressedFiles.push(compressedFile);
            } catch (error) {
                console.error('Error compressing file:', file.name, error);
                // Fallback: Jika kompresi gagal, tetap kirim file asli
                compressedFiles.push(file);
            }
        } else {
            // Jika bukan image (misal PDF), lewati tanpa proses
            compressedFiles.push(file);
        }
    }

    return compressedFiles;
}
