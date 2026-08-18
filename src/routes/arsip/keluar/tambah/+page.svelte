<script lang="ts">
	import { ArrowLeft, Save, Loader2 } from '@lucide/svelte';
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let isLoading = $state(false);

	// State for the main fixed columns
	let formData = $state({
		no_register: '',
		tanggal_pembuatan: '',
		no_index: '',
		tujuan: '',
		perihal: '',
		nama_pemohon: '',
		keterangan: '',
		file_url: ''
	});

	// Array of extra dynamic fields to populate custom_fields JSONB
	let customFields = $state<{ key: string; value: string }[]>([]);

	let newFieldKey = $state('');

	let selectedFiles = $state<File[]>([]);
	let isScanning = $state(false);

	async function handleAutoFill() {
		if (selectedFiles.length === 0) return;
		
		isScanning = true;
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
				if (result.data.nomor_register) formData.no_register = result.data.nomor_register;
				if (result.data.nomor_index) formData.no_index = result.data.nomor_index;
				if (result.data.tanggal_pembuatan) formData.tanggal_pembuatan = result.data.tanggal_pembuatan;
				if (result.data.perihal) formData.perihal = result.data.perihal;
				if (result.data.tujuan) formData.tujuan = result.data.tujuan;
				if (result.data.nama_pemohon) formData.nama_pemohon = result.data.nama_pemohon;
				if (result.data.keterangan) formData.keterangan = result.data.keterangan;
				alert('✨ Form berhasil diisi otomatis oleh AI!');
			}
		} catch (err: any) {
			alert('AI gagal membaca dokumen: ' + err.message);
		} finally {
			isScanning = false;
		}
	}

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
			newFieldKey = ''; // reset
		}
	}

	function removeCustomField(index: number) {
		customFields.splice(index, 1);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isLoading = true;

		let finalFileUrl = formData.file_url;

		// 1. Upload file if selected
		if (selectedFiles.length > 0) {
			try {
				const uploadData = new FormData();
				selectedFiles.forEach(f => uploadData.append('files', f));
				uploadData.append('folderType', 'Surat Keluar');
				// Gunakan tanggal hari ini jika tanggal_pembuatan kosong
				const tgl = formData.tanggal_pembuatan || new Date().toISOString().split('T')[0];
				uploadData.append('tanggal', tgl);
				
				// Standardisasi nama file: {no_register}_{no_index}_{tanggal}_{perihal}_{keterangan}
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

		// Convert custom fields array into JSON object
		const custom_fields_obj = customFields.reduce((acc, curr) => {
			if (curr.key) acc[curr.key] = curr.value;
			return acc;
		}, {} as Record<string, string>);

		const { error } = await supabase
			.from('arsip_surat_keluar')
			.insert([{ ...formData, file_url: finalFileUrl, custom_fields: custom_fields_obj }]);

		isLoading = false;

		if (error) {
			alert('Gagal menyimpan data: ' + error.message);
		} else {
			// Redirect back to list
			goto('/arsip/keluar');
		}
	}
</script>

<div class="flex h-full flex-col bg-slate-50">
	<header class="bg-white px-4 py-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
		<button onclick={() => goto('/arsip/keluar')} class="p-1 text-slate-600 hover:text-slate-900 active:bg-slate-100 rounded-full">
			<ArrowLeft size={24} />
		</button>
		<h1 class="text-xl font-bold tracking-tight text-slate-800">Tambah Surat Keluar</h1>
	</header>

	<main class="flex-1 overflow-y-auto p-4 pb-8">
		<form onsubmit={handleSubmit} class="space-y-6 max-w-2xl mx-auto">
			
			<!-- Core Fields -->
			<div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
				<h2 class="font-semibold text-slate-800 border-b border-slate-100 pb-2">Informasi Utama</h2>
				
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="space-y-1">
						<label class="text-sm font-medium text-slate-700" for="no_register">Nomor Register</label>
						<input type="text" id="no_register" bind:value={formData.no_register} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" required />
						{#if data.lastRegister}
							<p class="text-xs text-slate-500 mt-1">Nomor register terakhir: <span class="font-bold text-slate-700">{data.lastRegister}</span></p>
						{:else}
							<p class="text-xs text-slate-500 mt-1">Belum ada data register.</p>
						{/if}
					</div>
					
					<div class="space-y-1">
						<label class="text-sm font-medium text-slate-700" for="no_index">Nomor Index</label>
						<input type="text" id="no_index" bind:value={formData.no_index} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
					</div>
				</div>

				<div class="space-y-1">
					<label class="text-sm font-medium text-slate-700" for="tanggal_pembuatan">Tanggal Pembuatan</label>
					<input type="date" id="tanggal_pembuatan" bind:value={formData.tanggal_pembuatan} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
				</div>

				<div class="space-y-1">
					<label class="text-sm font-medium text-slate-700" for="tujuan">Tujuan Instansi</label>
					<input type="text" id="tujuan" bind:value={formData.tujuan} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
				</div>

				<div class="space-y-1">
					<label class="text-sm font-medium text-slate-700" for="perihal">Perihal Surat</label>
					<textarea id="perihal" bind:value={formData.perihal} rows="2" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"></textarea>
				</div>
				
				<div class="space-y-1 sm:col-span-2">
					<label class="text-sm font-medium text-slate-700" for="nama_pemohon">Nama Pemohon</label>
					<input bind:value={formData.nama_pemohon} type="text" id="nama_pemohon" placeholder="Nama warga (Misal: Budi Santoso)" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
					<p class="text-[11px] text-slate-500 mt-1">Nama warga yang menjadi subjek/peminta surat tersebut.</p>
				</div>

				<div class="space-y-1 sm:col-span-2">
					<label class="text-sm font-medium text-slate-700" for="keterangan">Catatan Tambahan (Keterangan)</label>
					<input bind:value={formData.keterangan} type="text" id="keterangan" placeholder="Catatan opsional (Misal: Untuk syarat BPJS)" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow" />
					<p class="text-[11px] text-slate-500 mt-1">Alasan atau keterangan lain yang spesifik tentang surat ini.</p>
				</div>
			</div>

			<!-- Digital Document -->
			<div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
				<h2 class="font-semibold text-slate-800 border-b border-slate-100 pb-2">Dokumen Digital</h2>
				<div class="space-y-1">
					<label class="text-sm font-medium text-slate-700" for="file_upload">Unggah Foto / PDF Surat</label>
					<input type="file" id="file_upload" accept="image/jpeg, image/png, application/pdf" multiple onchange={handleFileChange} class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
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
								✨ Pindai & Isi Form Otomatis
							{/if}
						</button>
					{/if}
					<p class="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">Kosongkan jika dokumen fisik belum didigitalisasi. Anda bisa memilih lebih dari satu gambar sekaligus untuk dijadikan 1 dokumen PDF utuh.</p>
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
					<input type="text" bind:value={newFieldKey} placeholder="Nama Kolom Baru (Cth: Nama Pengirim)" class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none" />
					<button type="button" onclick={addCustomField} class="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">
						Tambah
					</button>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex items-center gap-3 pt-2">
				<button type="button" onclick={() => goto('/arsip/keluar')} class="flex-1 rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
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
