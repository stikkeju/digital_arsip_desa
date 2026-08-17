<script lang="ts">
	import { Search, Filter, Plus, Send, LayoutGrid, List, FileBadge, ExternalLink } from '@lucide/svelte';

	let { data } = $props();
	let arsipKeluar = $derived(data.arsipKeluar || []);
	
	// View toggle & search state
	let viewMode: 'card' | 'table' = $state('card');
	let searchQuery = $state('');

	let filterMonth = $state('');
	let filterYear = $state('');
	let filterIndex = $state('');

	// Extract unique no_index
	let uniqueIndices = $derived(
		Array.from(new Set(arsipKeluar.map(s => s.no_index).filter(Boolean))).sort()
	);

	// Client-side search filtering
	let filteredArsip = $derived(
		arsipKeluar.filter((surat) => {
			// Date filter logic
			if (filterMonth || filterYear) {
				if (!surat.tanggal_pembuatan) return false;
				const d = new Date(surat.tanggal_pembuatan);
				if (filterYear && d.getFullYear().toString() !== filterYear) return false;
				if (filterMonth && (d.getMonth() + 1).toString() !== filterMonth) return false;
			}
			
			// Index filter logic
			if (filterIndex && surat.no_index !== filterIndex) return false;

			// Smart Search logic
			if (!searchQuery.trim()) return true;
			
			const terms = searchQuery.toLowerCase().split(' ').filter(t => t);
			const fullText = [
				surat.no_register || '',
				surat.no_index || '',
				surat.tujuan || '',
				surat.perihal || '',
				surat.keterangan || ''
			].join(' ').toLowerCase();

			return terms.every(term => fullText.includes(term));
		})
	);

	function formatDate(dateStr: string | null) {
		if (!dateStr) return '-';
		try {
			const d = new Date(dateStr);
			return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
		} catch (e) {
			return dateStr;
		}
	}
</script>

<div class="flex h-full flex-col">
	<header class="bg-white px-4 py-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
		<h1 class="text-xl font-bold tracking-tight text-slate-800">
			Arsip Surat Keluar
		</h1>
	</header>

	<div class="space-y-4 p-4">
		<!-- Actions Bar -->
		<div class="flex flex-col md:flex-row items-center gap-2">
			<div class="relative flex-1 w-full">
				<Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
				<input 
					type="text" 
					bind:value={searchQuery}
					placeholder="Cari arsip..." 
					class="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
				/>
			</div>
			
			<div class="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto">
				<select bind:value={filterIndex} class="rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 flex-1 sm:flex-none">
					<option value="">Semua Index</option>
					{#each uniqueIndices as idx}
						<option value={idx}>{idx}</option>
					{/each}
				</select>

				<select bind:value={filterMonth} class="rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 flex-1 sm:flex-none">
					<option value="">Bulan</option>
					<option value="1">Jan</option>
					<option value="2">Feb</option>
					<option value="3">Mar</option>
					<option value="4">Apr</option>
					<option value="5">Mei</option>
					<option value="6">Jun</option>
					<option value="7">Jul</option>
					<option value="8">Agu</option>
					<option value="9">Sep</option>
					<option value="10">Okt</option>
					<option value="11">Nov</option>
					<option value="12">Des</option>
				</select>

				<select bind:value={filterYear} class="rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 flex-1 sm:flex-none">
					<option value="">Tahun</option>
					{#each Array.from({length: 10}, (_, i) => new Date().getFullYear() - i) as year}
						<option value={year.toString()}>{year}</option>
					{/each}
				</select>

				<div class="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm shrink-0">
					<button 
						class="rounded-lg p-1.5 transition-colors {viewMode === 'card' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}"
						onclick={() => viewMode = 'card'}
					>
						<LayoutGrid size={18} strokeWidth={2.5} />
					</button>
					<button 
						class="rounded-lg p-1.5 transition-colors {viewMode === 'table' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}"
						onclick={() => viewMode = 'table'}
					>
						<List size={18} strokeWidth={2.5} />
					</button>
				</div>
			</div>
		</div>

		{#if filteredArsip.length === 0}
			<div class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
				<Search size={32} class="text-slate-300" />
				<p>Tidak ada arsip yang ditemukan.</p>
			</div>
		{:else}
			<!-- Content View -->
			{#if viewMode === 'card'}
				<!-- Card List -->
				<div class="space-y-4 pb-4">
					{#each filteredArsip as surat}
						<div class="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
							<!-- Card Header -->
							<div class="border-b border-slate-100 bg-slate-50/50 px-4 py-3 flex items-center justify-between">
								<div class="flex items-center gap-2">
									<span class="rounded-lg bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700 uppercase tracking-wider">
										Reg: {surat.no_register}
									</span>
									<span class="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-sm">
										{surat.no_index || '-'}
									</span>
								</div>
								
								<span class="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{formatDate(surat.tanggal_pembuatan)}</span>
							</div>

							<!-- Card Body -->
							<div class="p-4 space-y-3 relative">
								<h3 class="text-[15px] font-bold text-slate-800 leading-snug pr-8">{surat.perihal || 'Tanpa Perihal'}</h3>
								
								<div class="flex items-center gap-2 text-sm text-slate-600">
									<div class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 flex-shrink-0">
										<Send size={12} class="text-slate-500"/>
									</div>
									<span class="truncate font-medium">{surat.tujuan || '-'}</span>
								</div>

								{#if surat.keterangan}
									<p class="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">Ket: <span class="text-slate-700">{surat.keterangan}</span></p>
								{/if}

								<!-- File Action -->
								{#if surat.file_url}
									<div class="pt-2">
										<a href={surat.file_url} target="_blank" class="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100 transition-colors">
											<FileBadge size={14} />
											Buka Dokumen
											<ExternalLink size={12} class="ml-0.5" />
										</a>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<!-- Table View -->
				<div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm pb-2">
					<table class="w-full text-left text-sm text-slate-600">
						<thead class="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
							<tr>
								<th class="px-4 py-4 whitespace-nowrap">No. Reg</th>
								<th class="px-4 py-4 whitespace-nowrap">No. Index</th>
								<th class="px-4 py-4 whitespace-nowrap">Tgl. Pembuatan</th>
								<th class="px-4 py-4 min-w-[200px]">Tujuan</th>
								<th class="px-4 py-4 min-w-[250px]">Perihal</th>
								<th class="px-4 py-4 whitespace-nowrap">Ket</th>
								<th class="px-4 py-4 whitespace-nowrap text-center">Dokumen</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#each filteredArsip as surat}
								<tr class="hover:bg-slate-50/80 transition-colors">
									<td class="px-4 py-3 font-bold text-slate-800">{surat.no_register}</td>
									<td class="px-4 py-3 font-medium">{surat.no_index || '-'}</td>
									<td class="px-4 py-3 whitespace-nowrap text-slate-500">{formatDate(surat.tanggal_pembuatan)}</td>
									<td class="px-4 py-3 font-medium text-slate-700">{surat.tujuan || '-'}</td>
									<td class="px-4 py-3 font-semibold text-slate-800">{surat.perihal || '-'}</td>
									<td class="px-4 py-3 text-slate-500">{surat.keterangan || '-'}</td>
									<td class="px-4 py-3 text-center align-middle">
										{#if surat.file_url}
											<a href={surat.file_url} target="_blank" class="inline-flex items-center justify-center p-1.5 text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors" title="Lihat Dokumen">
												<FileBadge size={18} />
											</a>
										{:else}
											<span class="text-slate-300 font-bold">-</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		{/if}
	</div>

	<!-- FAB -->
	<a href="/arsip/keluar/tambah" class="fixed bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-xl shadow-primary-600/30 transition-transform active:scale-95 hover:bg-primary-700">
		<Plus size={28} strokeWidth={2.5} />
	</a>
</div>
