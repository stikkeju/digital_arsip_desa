import { supabase } from '$lib/supabaseClient';

export async function load() {
    const [masukCount, keluarCount] = await Promise.all([
        supabase.from('arsip_surat_masuk').select('*', { count: 'exact', head: true }),
        supabase.from('arsip_surat_keluar').select('*', { count: 'exact', head: true })
    ]);

    return {
        countMasuk: masukCount.count || 0,
        countKeluar: keluarCount.count || 0
    };
}
