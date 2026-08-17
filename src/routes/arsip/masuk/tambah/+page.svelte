<script lang="ts">
	import { ArrowLeft, Save, Loader2 } from '@lucide/svelte';
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';

	let isLoading = $state(false);

	// State for the main fixed columns (Arsip Masuk)
	let formData = $state({
		no_register: '',
		tanggal_terima: '',
		pengirim: '',
		perihal: '',
		keterangan: '',
		file_url: ''
	});

	// Array of extra dynamic fields to populate custom_fields JSONB
	let customFields = $state<{ key: string; value: string }[]>([]);

	let newFieldKey = $state('');

	function addCustomField() {
		if (newFieldKey.trim()) {
			customFields.push({ key: newFieldKey.trim(), value: '' });
			newFieldKey = ''; // reset
		}
	}

	function removeCustomField(index: number) {
		customFields.splice(index, 1);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isLoading = true;

		// Convert custom fields array into JSON object
		const custom_fields_obj = customFields.reduce((acc, curr) => {
			if (curr.key) acc[curr.key] = curr.value;
			return acc;
		}, {} as Record<string, string>);

		const { error } = await supabase
			.from('arsip_surat_masuk')
			.insert([{ ...formData, custom_fields: custom_fields_obj }]);

		isLoading = false;

		if (error) {
			alert('Gagal menyimpan data: ' + error.message);
		} else {
			// Redirect back to list
			goto('/arsip/masuk');
		}
	}
</script>

<div class="flex h-screen flex-col bg-slate-50">
	<header class="bg-white px-4 py-4 shadow-sm flex items-center gap-3">
		<button onclick={() => goto('/arsip/masuk')} class="p-1 text-slate-600 hover:text-slate-900 active:bg-slate-100 rounded-full">
			<ArrowLeft size={24} />
		</button>
		<h1 class="text-xl font-bold tracking-tight text-slate-800">Tambah Surat Masuk</h1>
	</header>

	<main class="flex-1 overflow-y-auto p-4 pb-8">
		<form onsubmit={handleSubmit} class="space-y-6 max-w-2xl mx-auto">
			
			<!-- Core Fields -->
			<div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
				<h2 class="font-semibold text-slate-800 border-b border-slate-100 pb-2">Informasi Utama</h2>
				
				<div class="space-y-1">
					<label class="text-sm font-medium text-slate-700" for="no_register">Nomor Register</label>
					<input type="text" id="no_register" bind:value={formData.no_register} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" required />
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="space-y-1">
						<label class="text-sm font-medium text-slate-700" for="tanggal_terima">Tanggal Terima</label>
						<input type="date" id="tanggal_terima" bind:value={formData.tanggal_terima} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
					</div>
					
					<div class="space-y-1">
						<label class="text-sm font-medium text-slate-700" for="pengirim">Pengirim</label>
						<input type="text" id="pengirim" bind:value={formData.pengirim} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
					</div>
				</div>

				<div class="space-y-1">
					<label class="text-sm font-medium text-slate-700" for="perihal">Perihal Surat</label>
					<textarea id="perihal" bind:value={formData.perihal} rows="2" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"></textarea>
				</div>
				
				<div class="space-y-1">
					<label class="text-sm font-medium text-slate-700" for="keterangan">Keterangan Tambahan</label>
					<input type="text" id="keterangan" bind:value={formData.keterangan} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
				</div>
			</div>

			<!-- Digital Document -->
			<div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
				<h2 class="font-semibold text-slate-800 border-b border-slate-100 pb-2">Dokumen Digital</h2>
				<div class="space-y-1">
					<label class="text-sm font-medium text-slate-700" for="file_url">Tautan (Link) Google Drive</label>
					<input type="url" id="file_url" bind:value={formData.file_url} placeholder="https://drive.google.com/..." class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
					<p class="text-xs text-slate-500 mt-1">Kosongkan jika dokumen fisik belum didigitalisasi.</p>
				</div>
			</div>

			<!-- Flexible / Custom Fields -->
			<div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
				<div class="flex items-center justify-between border-b border-slate-100 pb-2">
					<h2 class="font-semibold text-slate-800">Kolom Tambahan (Opsional)</h2>
				</div>
				
				{#if customFields.length > 0}
					<div class="space-y-3">
						{#each customFields as field, i}
							<div class="flex items-center gap-2">
								<div class="flex-1 space-y-1">
									<label class="text-xs font-medium text-slate-500" for={`custom_${i}`}>{field.key}</label>
									<input type="text" id={`custom_${i}`} bind:value={field.value} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500" />
								</div>
								<button type="button" onclick={() => removeCustomField(i)} class="mt-5 text-red-500 hover:bg-red-50 p-2 rounded-lg text-sm">Hapus</button>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-slate-500 italic">Belum ada kolom tambahan.</p>
				{/if}

				<div class="flex gap-2 mt-4 pt-4 border-t border-slate-100">
					<input type="text" bind:value={newFieldKey} placeholder="Nama Kolom Baru (Cth: Diteruskan Kepada)" class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none" />
					<button type="button" onclick={addCustomField} class="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">
						Tambah
					</button>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex items-center gap-3 pt-2">
				<button type="button" onclick={() => goto('/arsip/masuk')} class="flex-1 rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
					Batal
				</button>
				<button type="submit" disabled={isLoading} class="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors disabled:opacity-70">
					{#if isLoading}
						<Loader2 class="animate-spin" size={18} />
						Menyimpan...
					{:else}
						<Save size={18} />
						Simpan Arsip
					{/if}
				</button>
			</div>
		</form>
	</main>
</div>
