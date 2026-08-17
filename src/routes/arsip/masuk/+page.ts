import { supabase } from '$lib/supabaseClient';

export async function load() {
    // Fetch top 50 records
    const { data, error } = await supabase
        .from('arsip_surat_masuk')
        .select('*')
        .order('id', { ascending: false })
        .limit(50);
        
    if (error) {
        console.error("Error fetching data from Supabase:", error);
        return { arsipMasuk: [] };
    }

    return { arsipMasuk: data };
}
