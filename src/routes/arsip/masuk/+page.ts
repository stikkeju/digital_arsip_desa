import { supabase } from '$lib/supabaseClient';

export async function load() {
    const { data, error } = await supabase
        .from('arsip_surat_masuk')
        .select('*')
        .order('id', { ascending: true });
        
    if (error) {
        console.error("Error fetching data from Supabase:", error);
        return { arsipMasuk: [] };
    }

    return { arsipMasuk: data };
}
