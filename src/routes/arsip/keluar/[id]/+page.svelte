<script lang="ts">
	import { ArrowLeft, Save, Loader2, Trash2, ExternalLink } from '@lucide/svelte';
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let arsip = data.arsip;

	let isLoading = $state(false);
	let isDeleting = $state(false);
	let isScanning = $state(false);
	let aiSuggestions = $state<any>(null);

	let formData = $state({
		no_register: arsip.no_register || '',
		no_index: arsip.no_index || '',
		tanggal_pembuatan: arsip.tanggal_pembuatan || '',
		tujuan: arsip.tujuan || '',
		perihal: arsip.perihal || '',
		nama_pemohon: arsip.nama_pemohon || '',
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

	async function handleAutoFill() {
		if (selectedFiles.length === 0) return;
		
		isScanning = true;
		aiSuggestions = null;
		
		try {
			const ocrData = new FormData();
			ocrData.append('files', selectedFiles[0]); // Kirim foto pertama saja
			ocrData.append('formType', 'keluar');

			const res = await fetch('/api/ocr', {
				method: 'POST',
				body: ocrData
			});

			const result = await res.json();
			if (!res.ok || result.error) {
				throw new Error(result.error || 'Gagal memproses AI OCR');
			}

			if (result.data) {
				aiSuggestions = result.data;
				alert('✨ AI selesai membaca dokumen! Periksa saran berkedip di bawah setiap isian.');
			}
		} catch (err: any) {
			alert('AI gagal membaca dokumen: ' + err.message);
		} finally {
			isScanning = false;
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
				uploadData.append('folderType', 'Surat Keluar');
				const tgl = formData.tanggal_pembuatan || new Date().toISOString().split('T')[0];
				uploadData.append('tanggal', tgl);
				
				const noIndex = formData.no_index.replace(/[^a-zA-Z0-9]/g, '_') || 'Keluar';
				const safePerihal = formData.perihal.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 150);
				const safeKet = formData.keterangan.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 150);
				const filename = `${formData.no_register}_${noIndex}_${tgl}_${safePerihal}_${safeKet}`.replace(/_+/g, '_');
				
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
			.from('arsip_surat_keluar')
			.update({ ...formData, file_url: finalFileUrl, custom_fields: custom_fields_obj })
			.eq('id', arsip.id);

		isLoading = false;

		if (error) {
			alert('Gagal memperbarui data: ' + error.message);
		} else {
			goto('/arsip/keluar');
		}
	}

	async function handleDelete() {
		const confirmDelete = confirm('Apakah Anda yakin ingin menghapus arsip ini secara permanen?');
		if (!confirmDelete) return;

		isDeleting = true;

		if (arsip.file_url) {
			try {
				await fetch('/api/delete-file', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ file_url: arsip.file_url })
				});
			} catch (e) {
				console.error('Gagal menghapus file dari drive', e);
			}
		}

		const { error } = await supabase
			.from('arsip_surat_keluar')
			.delete()
			.eq('id', arsip.id);

		isDeleting = false;

		if (error) {
			alert('Gagal menghapus data: ' + error.message);
		} else {
			goto('/arsip/keluar');
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
				.from('arsip_surat_keluar')
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
			<button onclick={() => goto('/arsip/keluar')} class="p-1 text-slate-600 hover:text-slate-900 active:bg-slate-100 rounded-full transition-colors">
				<ArrowLeft size={24} />
			</button>
			<h1 class="text-xl font-bold tracking-tight text-slate-800">Detail Surat Keluar</h1>
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
						<input type="text" id="no_register" bind:value={formData.no_register} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" required />
						{#if aiSuggestions?.nomor_register && aiSuggestions.nomor_register !== formData.no_register}
							<div class="mt-1 flex flex-wrap items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-1.5 text-[11px] text-indigo-700 border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-1">
								<span class="font-medium flex items-center gap-1"><span class="text-indigo-400">✨</span> Saran AI:</span>
								<span class="font-bold truncate max-w-[200px]">{aiSuggestions.nomor_register}</span>
								<button type="button" onclick={() => { formData.no_register = aiSuggestions.nomor_register; aiSuggestions.nomor_register = null; }} class="ml-auto rounded bg-indigo-100 hover:bg-indigo-200 px-2 py-0.5 font-bold transition-colors">Pakai Ini</button>
							</div>
						{/if}
					</div>
					
					<div class="space-y-1">
						<label class="text-sm font-medium text-slate-700" for="no_index">Nomor Index</label>
						<input type="text" id="no_index" bind:value={formData.no_index} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
						{#if aiSuggestions?.nomor_index && aiSuggestions.nomor_index !== formData.no_index}
							<div class="mt-1 flex flex-wrap items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-1.5 text-[11px] text-indigo-700 border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-1">
								<span class="font-medium flex items-center gap-1"><span class="text-indigo-400">✨</span> Saran AI:</span>
								<span class="font-bold truncate max-w-[200px]">{aiSuggestions.nomor_index}</span>
								<button type="button" onclick={() => { formData.no_index = aiSuggestions.nomor_index; aiSuggestions.nomor_index = null; }} class="ml-auto rounded bg-indigo-100 hover:bg-indigo-200 px-2 py-0.5 font-bold transition-colors">Pakai Ini</button>
							</div>
						{/if}
					</div>
				</div>

				<div class="space-y-1">
					<label class="text-sm font-medium text-slate-700" for="tanggal_pembuatan">Tanggal Pembuatan</label>
					<input type="date" id="tanggal_pembuatan" bind:value={formData.tanggal_pembuatan} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
					{#if aiSuggestions?.tanggal_pembuatan && aiSuggestions.tanggal_pembuatan !== formData.tanggal_pembuatan}
						<div class="mt-1 flex flex-wrap items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-1.5 text-[11px] text-indigo-700 border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-1">
							<span class="font-medium flex items-center gap-1"><span class="text-indigo-400">✨</span> Saran AI:</span>
							<span class="font-bold truncate max-w-[200px]">{aiSuggestions.tanggal_pembuatan}</span>
							<button type="button" onclick={() => { formData.tanggal_pembuatan = aiSuggestions.tanggal_pembuatan; aiSuggestions.tanggal_pembuatan = null; }} class="ml-auto rounded bg-indigo-100 hover:bg-indigo-200 px-2 py-0.5 font-bold transition-colors">Pakai Ini</button>
						</div>
					{/if}
				</div>

				<div class="space-y-1">
					<label class="text-sm font-medium text-slate-700" for="tujuan">Tujuan Instansi</label>
					<input type="text" id="tujuan" bind:value={formData.tujuan} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
					{#if aiSuggestions?.tujuan && aiSuggestions.tujuan !== formData.tujuan}
						<div class="mt-1 flex flex-wrap items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-1.5 text-[11px] text-indigo-700 border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-1">
							<span class="font-medium flex items-center gap-1"><span class="text-indigo-400">✨</span> Saran AI:</span>
							<span class="font-bold truncate max-w-[400px]">{aiSuggestions.tujuan}</span>
							<button type="button" onclick={() => { formData.tujuan = aiSuggestions.tujuan; aiSuggestions.tujuan = null; }} class="ml-auto rounded bg-indigo-100 hover:bg-indigo-200 px-2 py-0.5 font-bold transition-colors">Pakai Ini</button>
						</div>
					{/if}
				</div>

				<div class="space-y-1">
					<label class="text-sm font-medium text-slate-700" for="perihal">Perihal Surat</label>
					<textarea id="perihal" bind:value={formData.perihal} rows="2" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"></textarea>
					{#if aiSuggestions?.perihal && aiSuggestions.perihal !== formData.perihal}
						<div class="mt-1 flex flex-wrap items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-1.5 text-[11px] text-indigo-700 border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-1">
							<span class="font-medium flex items-center gap-1"><span class="text-indigo-400">✨</span> Saran AI:</span>
							<span class="font-bold truncate max-w-[400px]">{aiSuggestions.perihal}</span>
							<button type="button" onclick={() => { formData.perihal = aiSuggestions.perihal; aiSuggestions.perihal = null; }} class="ml-auto rounded bg-indigo-100 hover:bg-indigo-200 px-2 py-0.5 font-bold transition-colors">Pakai Ini</button>
						</div>
					{/if}
				</div>
				
				<div class="space-y-1 sm:col-span-2">
					<label class="text-sm font-medium text-slate-700" for="nama_pemohon">Nama Pemohon</label>
					<input bind:value={formData.nama_pemohon} type="text" id="nama_pemohon" placeholder="Nama warga (Misal: Budi Santoso)" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
					<p class="text-[11px] text-slate-500 mt-1">Nama warga yang menjadi subjek/peminta surat tersebut.</p>
					{#if aiSuggestions?.nama_pemohon && aiSuggestions.nama_pemohon !== formData.nama_pemohon}
						<div class="mt-1 flex flex-wrap items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-1.5 text-[11px] text-indigo-700 border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-1">
							<span class="font-medium flex items-center gap-1"><span class="text-indigo-400">✨</span> Saran AI:</span>
							<span class="font-bold truncate max-w-[400px]">{aiSuggestions.nama_pemohon}</span>
							<button type="button" onclick={() => { formData.nama_pemohon = aiSuggestions.nama_pemohon; aiSuggestions.nama_pemohon = null; }} class="ml-auto rounded bg-indigo-100 hover:bg-indigo-200 px-2 py-0.5 font-bold transition-colors">Pakai Ini</button>
						</div>
					{/if}
				</div>

				<div class="space-y-1 sm:col-span-2">
					<label class="text-sm font-medium text-slate-700" for="keterangan">Catatan Tambahan (Keterangan)</label>
					<input bind:value={formData.keterangan} type="text" id="keterangan" placeholder="Catatan opsional (Misal: Untuk syarat BPJS)" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow" />
					<p class="text-[11px] text-slate-500 mt-1">Alasan atau keterangan lain yang spesifik tentang surat ini.</p>
					{#if aiSuggestions?.keterangan && aiSuggestions.keterangan !== formData.keterangan}
						<div class="mt-1 flex flex-wrap items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-1.5 text-[11px] text-indigo-700 border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-1">
							<span class="font-medium flex items-center gap-1"><span class="text-indigo-400">✨</span> Saran AI:</span>
							<span class="font-bold truncate max-w-[400px]">{aiSuggestions.keterangan}</span>
							<button type="button" onclick={() => { formData.keterangan = aiSuggestions.keterangan; aiSuggestions.keterangan = null; }} class="ml-auto rounded bg-indigo-100 hover:bg-indigo-200 px-2 py-0.5 font-bold transition-colors">Pakai Ini</button>
						</div>
					{/if}
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

						<button type="button" onclick={handleAutoFill} disabled={isScanning} class="mt-3 w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-70">
							{#if isScanning}
								<Loader2 class="animate-spin" size={16} />
								Memindai Dokumen...
							{:else}
								✨ Pindai & Cocokkan Data
							{/if}
						</button>
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
									<input type="text" id={`custom_${i}`} bind:value={field.value} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500" />
								</div>
								<button type="button" onclick={() => removeCustomField(i)} class="mt-5 text-red-500 hover:bg-red-50 p-2 rounded-lg text-sm transition-colors">Hapus</button>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-slate-500 italic">Belum ada kolom tambahan.</p>
				{/if}

				<div class="flex gap-2 mt-4 pt-4 border-t border-slate-100">
					<input type="text" bind:value={newFieldKey} placeholder="Nama Kolom Baru (Cth: Diteruskan Kepada)" class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500" />
					<button type="button" onclick={addCustomField} class="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
						Tambah
					</button>
				</div>
			</div>

			<div class="flex items-center gap-3 pt-2">
				<button type="button" onclick={() => goto('/arsip/keluar')} class="flex-1 rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
					Batal
				</button>
				<button type="submit" disabled={isLoading || isDeleting} class="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors disabled:opacity-70">
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
