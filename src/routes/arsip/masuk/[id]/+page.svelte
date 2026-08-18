<script lang="ts">
	import { ArrowLeft, Save, Loader2, Trash2, ExternalLink } from '@lucide/svelte';
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let arsip = data.arsip;

	let isLoading = $state(false);
	let isDeleting = $state(false);

	let formData = $state({
		no_register: arsip.no_register || '',
		no_surat: arsip.no_surat || '',
		tanggal_terima: arsip.tanggal_terima || '',
		pengirim: arsip.pengirim || '',
		perihal: arsip.perihal || '',
		keterangan: arsip.keterangan || '',
		file_url: arsip.file_url || ''
	});

	// Reconstruct custom fields array from JSONB object
	let customFields = $state<{ key: string; value: string }[]>(
		arsip.custom_fields
			? Object.entries(arsip.custom_fields).map(([k, v]) => ({ key: k, value: String(v) }))
			: []
	);

	let newFieldKey = $state('');
	let selectedFiles = $state<File[]>([]);

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			selectedFiles = Array.from(target.files);
		} else {
			selectedFiles = [];
		}
	}

	function addCustomField() {
		if (newFieldKey.trim()) {
			customFields.push({ key: newFieldKey.trim(), value: '' });
			newFieldKey = '';
		}
	}

	function removeCustomField(index: number) {
		customFields.splice(index, 1);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isLoading = true;

		let finalFileUrl = formData.file_url;

		if (selectedFiles.length > 0) {
			try {
				const uploadData = new FormData();
				selectedFiles.forEach(f => uploadData.append('files', f));
				uploadData.append('folderType', 'Surat Masuk');
				const tgl = formData.tanggal_terima || new Date().toISOString().split('T')[0];
				uploadData.append('tanggal', tgl);
				
				const noIndex = 'Masuk';
				const safePerihal = formData.perihal.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 150);
				const safeKet = formData.keterangan.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 150);
				const noSurat = formData.no_surat ? formData.no_surat.replace(/[^a-zA-Z0-9]/g, '_') : 'TANPA_NO';
				const filename = `${formData.no_register}_${noSurat}_${noIndex}_${tgl}_${safePerihal}_${safeKet}`.replace(/_+/g, '_');
				
				uploadData.append('filename', filename);

				const res = await fetch('/api/upload', {
					method: 'POST',
					body: uploadData
				});

				const result = await res.json();
				if (!res.ok || result.error) {
					throw new Error(result.error || 'Gagal mengunggah file');
				}

				finalFileUrl = result.url;
			} catch (err: any) {
				alert('Gagal mengunggah dokumen: ' + err.message);
				isLoading = false;
				return;
			}
		}

		const custom_fields_obj = customFields.reduce((acc, curr) => {
			if (curr.key) acc[curr.key] = curr.value;
			return acc;
		}, {} as Record<string, string>);

		const { error } = await supabase
			.from('arsip_surat_masuk')
			.update({ ...formData, file_url: finalFileUrl, custom_fields: custom_fields_obj })
			.eq('id', arsip.id);

		isLoading = false;

		if (error) {
			alert('Gagal memperbarui data: ' + error.message);
		} else {
			goto('/arsip/masuk');
		}
	}

	async function handleDelete() {
		const confirmDelete = confirm('Apakah Anda yakin ingin menghapus arsip ini secara permanen?');
		if (!confirmDelete) return;

		isDeleting = true;

		// 1. Hapus dari Drive jika ada URL-nya
		if (arsip.file_url) {
			try {
				await fetch('/api/delete-file', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ file_url: arsip.file_url })
				});
			} catch (e) {
				console.error('Gagal menghapus file dari drive', e);
				// Tetap lanjutkan menghapus data DB
			}
		}

		// 2. Hapus dari Database
		const { error } = await supabase
			.from('arsip_surat_masuk')
			.delete()
			.eq('id', arsip.id);

		isDeleting = false;

		if (error) {
			alert('Gagal menghapus data: ' + error.message);
		} else {
			goto('/arsip/masuk');
		}
	}

	async function handleRemoveFileOnly() {
		const confirmDelete = confirm('Yakin ingin menghapus dokumen fisik dari arsip ini? (Data detail tetap dipertahankan)');
		if (!confirmDelete) return;

		isLoading = true;
		
		try {
			await fetch('/api/delete-file', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ file_url: arsip.file_url })
			});

			const { error } = await supabase
				.from('arsip_surat_masuk')
				.update({ file_url: null })
				.eq('id', arsip.id);

			if (error) throw error;

			arsip.file_url = '';
			formData.file_url = '';
			alert('File berhasil dihapus!');
		} catch (e: any) {
			alert('Gagal menghapus file: ' + e.message);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex h-full flex-col bg-slate-50">
	<header class="bg-white px-4 py-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
		<div class="flex items-center gap-3">
			<button onclick={() => goto('/arsip/masuk')} class="p-1 text-slate-600 hover:text-slate-900 active:bg-slate-100 rounded-full transition-colors">
				<ArrowLeft size={24} />
			</button>
			<h1 class="text-xl font-bold tracking-tight text-slate-800">Detail Surat Masuk</h1>
		</div>
		<button 
			type="button" 
			onclick={handleDelete} 
			disabled={isDeleting || isLoading}
			class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
		>
			{#if isDeleting}
				<Loader2 class="animate-spin" size={16} />
				Menghapus...
			{:else}
				<Trash2 size={16} />
				Hapus
			{/if}
		</button>
	</header>

	<main class="flex-1 overflow-y-auto p-4 pb-8">
		<form onsubmit={handleSubmit} class="space-y-6 max-w-2xl mx-auto">
			
			<div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
				<h2 class="font-semibold text-slate-800 border-b border-slate-100 pb-2">Informasi Utama</h2>
				
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="space-y-1">
						<label class="text-sm font-medium text-slate-700" for="no_register">Nomor Register</label>
						<input type="text" id="no_register" bind:value={formData.no_register} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" required />
					</div>

					<div class="space-y-1">
						<label class="text-sm font-medium text-slate-700" for="no_surat">Nomor Surat Asli</label>
						<input type="text" id="no_surat" bind:value={formData.no_surat} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Cth: B.123/DISPENDUK/2026" />
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="space-y-1">
						<label class="text-sm font-medium text-slate-700" for="tanggal_terima">Tanggal Terima</label>
						<input type="date" id="tanggal_terima" bind:value={formData.tanggal_terima} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
					</div>
					
					<div class="space-y-1">
						<label class="text-sm font-medium text-slate-700" for="pengirim">Pengirim</label>
						<input type="text" id="pengirim" bind:value={formData.pengirim} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
					</div>
				</div>

				<div class="space-y-1">
					<label class="text-sm font-medium text-slate-700" for="perihal">Perihal Surat</label>
					<textarea id="perihal" bind:value={formData.perihal} rows="2" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"></textarea>
				</div>
				
				<div class="space-y-1">
					<label class="text-sm font-medium text-slate-700" for="keterangan">Keterangan Tambahan</label>
					<input type="text" id="keterangan" bind:value={formData.keterangan} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
				</div>
			</div>

			<div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
				<div class="flex items-center justify-between border-b border-slate-100 pb-2">
					<h2 class="font-semibold text-slate-800">Dokumen Digital</h2>
					{#if arsip.file_url}
						<div class="flex items-center gap-2">
							<a href={arsip.file_url} target="_blank" class="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md transition-colors">
								Lihat File Saat Ini
								<ExternalLink size={12} />
							</a>
							<button type="button" onclick={handleRemoveFileOnly} disabled={isLoading} class="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50">
								Hapus File Saja
							</button>
						</div>
					{/if}
				</div>
				
				<div class="space-y-1">
					<label class="text-sm font-medium text-slate-700" for="file_upload">Ganti File (Unggah Baru)</label>
					<input type="file" id="file_upload" accept="image/jpeg, image/png, application/pdf" multiple onchange={handleFileChange} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
					{#if selectedFiles.length > 0}
						<div class="mt-2 p-2 bg-blue-50 rounded-lg">
							<p class="text-xs font-semibold text-blue-700">{selectedFiles.length} file dipilih:</p>
							<ul class="text-[11px] text-blue-600 list-disc list-inside mt-1">
								{#each selectedFiles as f}
									<li class="truncate">{f.name}</li>
								{/each}
							</ul>
						</div>
					{/if}
					<p class="text-xs text-slate-500 mt-1">Pilih file baru jika ingin mengganti dokumen sebelumnya. Anda bisa memilih lebih dari satu gambar sekaligus untuk digabungkan menjadi 1 dokumen PDF utuh.</p>
				</div>
			</div>

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
									<input type="text" id={`custom_${i}`} bind:value={field.value} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
								</div>
								<button type="button" onclick={() => removeCustomField(i)} class="mt-5 text-red-500 hover:bg-red-50 p-2 rounded-lg text-sm transition-colors">Hapus</button>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-slate-500 italic">Belum ada kolom tambahan.</p>
				{/if}

				<div class="flex gap-2 mt-4 pt-4 border-t border-slate-100">
					<input type="text" bind:value={newFieldKey} placeholder="Nama Kolom Baru (Cth: Diteruskan Kepada)" class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
					<button type="button" onclick={addCustomField} class="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
						Tambah
					</button>
				</div>
			</div>

			<div class="flex items-center gap-3 pt-2">
				<button type="button" onclick={() => goto('/arsip/masuk')} class="flex-1 rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
					Batal
				</button>
				<button type="submit" disabled={isLoading || isDeleting} class="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-70">
					{#if isLoading}
						<Loader2 class="animate-spin" size={18} />
						Menyimpan...
					{:else}
						<Save size={18} />
						Simpan Perubahan
					{/if}
				</button>
			</div>
		</form>
	</main>
</div>
