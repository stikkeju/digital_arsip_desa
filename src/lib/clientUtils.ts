import imageCompression from 'browser-image-compression';

/**
 * Compresses an array of File objects if they are images.
 * Non-image files (like PDFs) are returned exactly as they are.
 * 
 * @param files Array of files to process
 * @returns Promise that resolves to an array of compressed files
 */
export async function compressImageFiles(files: File[]): Promise<File[]> {
    const options = {
        maxSizeMB: 3,             // Batas maksimum 3MB
        maxWidthOrHeight: 1920,   // Skala proporsional max 1920px (1080p standar)
        useWebWorker: true,       // Jalan di background thread agar UI tidak beku
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
