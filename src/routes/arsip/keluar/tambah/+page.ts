import { supabase } from '$lib/supabaseClient';

export async function load() {
    const { data, error } = await supabase
        .from('arsip_surat_keluar')
        .select('no_register')
        .order('id', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) {
        return {
            lastRegister: null
        };
    }

    return {
        lastRegister: data.no_register
    };
}
