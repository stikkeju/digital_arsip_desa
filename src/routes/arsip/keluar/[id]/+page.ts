import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const { id } = params;

    const { data, error: dbError } = await supabase
        .from('arsip_surat_keluar')
        .select('*')
        .eq('id', id)
        .single();

    if (dbError || !data) {
        throw error(404, 'Arsip tidak ditemukan');
    }

    return {
        arsip: data
    };
}
