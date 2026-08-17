import { supabase } from '$lib/supabaseClient';

export async function load() {
    // Fetch top 50 records to prevent overwhelming the UI initially
    const { data, error } = await supabase
        .from('arsip_surat_keluar')
        .select('*')
        .order('id', { ascending: false })
        .limit(50);
        
    if (error) {
        console.error("Error fetching data from Supabase:", error);
        return { arsipKeluar: [] };
    }

    return { arsipKeluar: data };
}
