import { supabase } from '$lib/supabaseClient';

export async function load() {
    // Fetch data, sort by ID ascending (earliest register first assuming sequential inserts)
    const { data, error } = await supabase
        .from('arsip_surat_keluar')
        .select('*')
        .order('id', { ascending: true });
        
    if (error) {
        console.error("Error fetching data from Supabase:", error);
        return { arsipKeluar: [] };
    }

    return { arsipKeluar: data };
}
