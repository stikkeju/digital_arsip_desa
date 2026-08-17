import { supabase } from '$lib/supabaseClient';

export async function load() {
    const [masukRes, keluarRes] = await Promise.all([
        supabase.from('arsip_surat_masuk').select('id, tanggal_terima, perihal'),
        supabase.from('arsip_surat_keluar').select('id, tanggal_pembuatan, perihal')
    ]);

    return {
        arsipMasuk: masukRes.data || [],
        arsipKeluar: keluarRes.data || []
    };
}
