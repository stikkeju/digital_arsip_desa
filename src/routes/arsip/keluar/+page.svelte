<script lang="ts">
	import { Search, Filter, Plus, Send, LayoutGrid, List, FileBadge, ExternalLink, Download, FileType2, XCircle } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { downloadExcel, downloadPDF } from '$lib/exportUtils';
	import { auth } from '$lib/stores/auth.svelte.ts';
	import { page } from '$app/stores';

	let { data } = $props();
	let arsipKeluar = $derived(data.arsipKeluar || []);
	
	// View toggle & search state
	let viewMode: 'card' | 'table' = $state('card');
	let searchQuery = $state('');

	let filterMonth = $state('');
	let filterYear = $state('');
	let filterIndex = $state('');

	let urlTimeFilter = $derived($page.url.searchParams.get('time') || '');
	let isDashboardFilterActive = $derived(!!$page.url.searchParams.get('time') || !!$page.url.searchParams.get('q'));

	$effect(() => {
		const q = $page.url.searchParams.get('q');
		if (q && !searchQuery) {
			searchQuery = q;
		}
	});

	function clearDashboardFilter() {
		searchQuery = '';
		goto('/arsip/keluar', { replaceState: true });
	}

	function isDateInRange(dateStr: string | null, filter: string) {
		if (!dateStr) return false;
		if (filter === 'all' || !filter) return true;
		
		const date = new Date(dateStr);
		const today = new Date();
		
		if (filter === 'today') {
			return date.toDateString() === today.toDateString();
		}
		if (filter === '7days') {
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(today.getDate() - 7);
			return date >= sevenDaysAgo && date <= today;
		}
		if (filter === 'month') {
			return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
		}
		if (filter === 'year') {
			return date.getFullYear() === today.getFullYear();
		}
		return true;
	}

	// Extract unique no_index
	let uniqueIndices = $derived(
		Array.from(new Set(arsipKeluar.map(s => s.no_index ? s.no_index.split('/')[0].trim() : '').filter(Boolean))).sort()
	);

	function handleExport() {
		const exportData = filteredArsip.map((s, i) => ({
			'No': i + 1,
			'Nomor Register': s.no_register,
			'Nomor Index': s.no_index,
			'Tanggal Pembuatan': formatDate(s.tanggal_pembuatan),
			'Tujuan Instansi': s.tujuan,
			'Perihal': s.perihal,
			'Nama Pemohon': s.nama_pemohon || '-',
			'Keterangan': s.keterangan || '-'
		}));
		const title = `Surat_Keluar_${filterMonth || 'SemuaBulan'}_${filterYear || 'SemuaTahun'}`;
		downloadExcel(exportData, title, 'Surat Keluar');
	}

	async function handlePDF() {
		const title = 'BUKU AGENDA SURAT KELUAR';
		const periode = filterMonth || filterYear ? `${filterMonth ? 'Bulan ' + filterMonth : ''} ${filterYear || ''}`.trim() : 'Semua Waktu';
		
		const columns = [
			{ key: 'no_register', label: 'No. Reg' },
			{ key: 'no_index', label: 'No. Index' },
			{ key: 'tanggal_pembuatan', label: 'Tanggal' },
			{ key: 'tujuan', label: 'Tujuan' },
			{ key: 'perihal', label: 'Perihal' },
			{ key: 'nama_pemohon', label: 'Pemohon' },
			{ key: 'keterangan', label: 'Keterangan' }
		].map(c => ({ header: c.label, dataKey: c.key }));

		const data = filteredArsip.map(s => ({
			...s,
			tanggal_pembuatan: formatDate(s.tanggal_pembuatan),
			nama_pemohon: s.nama_pemohon || '-',
			keterangan: s.keterangan || '-'
		}));

		const filename = `Surat_Keluar_${filterMonth || 'SemuaBulan'}_${filterYear || 'SemuaTahun'}`;
		await downloadPDF(title, periode, columns, data, filename);
	}

	// Client-side search filtering
	let filteredArsip = $derived(
		arsipKeluar.filter((surat) => {
			// URL parameter Time range has highest priority
			if (urlTimeFilter && urlTimeFilter !== 'all') {
				if (!isDateInRange(surat.tanggal_pembuatan, urlTimeFilter)) return false;
			} else if (filterMonth || filterYear) {
				// Fallback to manual dropdown filters
				if (!surat.tanggal_pembuatan) return false;
				const d = new Date(surat.tanggal_pembuatan);
				if (filterYear && d.getFullYear().toString() !== filterYear) return false;
				if (filterMonth && (d.getMonth() + 1).toString() !== filterMonth) return false;
			}
			
			// Index filter logic
			if (filterIndex) {
				const currentIdx = surat.no_index ? surat.no_index.split('/')[0].trim() : '';
				if (currentIdx !== filterIndex) return false;
			}

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
		{#if isDashboardFilterActive}
			<div class="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center justify-between shadow-sm animate-in fade-in">
				<div class="text-sm text-indigo-800 font-medium flex items-center gap-2">
					<Filter size={16} />
					Menampilkan arsip berdasarkan filter dari Dashboard
				</div>
				<button onclick={clearDashboardFilter} class="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs font-bold px-2 py-1 bg-indigo-100/50 hover:bg-indigo-100 rounded-lg transition-colors">
					<XCircle size={14} />
					Hapus Filter
				</button>
			</div>
		{/if}

		<!-- Actions Bar -->
		<div class="flex flex-col gap-3">
			<div class="flex flex-col lg:flex-row items-center gap-2">
				<!-- Search -->
				<div class="relative flex-1 w-full">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
					<input 
						type="text" 
						bind:value={searchQuery}
						placeholder="Cari arsip..." 
						class="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
					/>
				</div>
				
				<!-- Filters and View Toggles -->
				<div class="flex flex-wrap lg:flex-nowrap gap-2 w-full lg:w-auto">
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

			<!-- Export Buttons Row -->
			<div class="flex gap-2 w-full justify-end">
				<button onclick={handleExport} class="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100 flex-1 sm:flex-none justify-center">
					<Download size={16} />
					<span>Excel</span>
				</button>
				<button onclick={handlePDF} class="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 flex-1 sm:flex-none justify-center">
					<FileType2 size={16} />
					<span>PDF</span>
				</button>
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
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div 
							onclick={() => goto(`/arsip/keluar/${surat.id}`)}
							class="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-primary-300 cursor-pointer"
						>
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
								<h3 class="text-[15px] font-bold text-slate-800 leading-snug pr-8 group-hover:text-primary-700 transition-colors">{surat.perihal || 'Tanpa Perihal'}</h3>
								
								<div class="flex items-center gap-2 text-sm text-slate-600 mt-1">
									<div class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 flex-shrink-0">
										<Send size={12} class="text-slate-500"/>
									</div>
									<span class="truncate font-medium">{surat.tujuan || '-'}</span>
								</div>

								{#if surat.nama_pemohon}
									<p class="text-xs text-slate-500 bg-blue-50 p-2 rounded-lg border border-blue-100 mt-2">Pemohon: <span class="text-slate-700 font-medium">{surat.nama_pemohon}</span></p>
								{/if}

								{#if surat.keterangan}
									<p class="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2">Ket: <span class="text-slate-700">{surat.keterangan}</span></p>
								{/if}

								<!-- File Action -->
								{#if surat.file_url}
									<div class="pt-2">
										<a 
											href={surat.file_url} 
											target="_blank" 
											onclick={(e) => e.stopPropagation()}
											class="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100 transition-colors"
										>
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
								<th class="px-4 py-4 min-w-[150px]">Nama Pemohon</th>
								<th class="px-4 py-4 min-w-[150px]">Ket</th>
								<th class="px-4 py-4 whitespace-nowrap text-center">Dokumen</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#each filteredArsip as surat}
								<tr onclick={() => goto(`/arsip/keluar/${surat.id}`)} class="hover:bg-primary-50/50 transition-colors cursor-pointer group">
									<td class="px-4 py-3 font-bold text-slate-800 group-hover:text-primary-700">{surat.no_register}</td>
									<td class="px-4 py-3 font-medium">{surat.no_index || '-'}</td>
									<td class="px-4 py-3 whitespace-nowrap text-slate-500">{formatDate(surat.tanggal_pembuatan)}</td>
									<td class="px-4 py-3 font-medium text-slate-700">{surat.tujuan || '-'}</td>
									<td class="px-4 py-3 font-semibold text-slate-800 group-hover:text-primary-700">{surat.perihal || '-'}</td>
									<td class="px-4 py-3 text-slate-700 font-medium">{surat.nama_pemohon || '-'}</td>
									<td class="px-4 py-3 text-slate-500">{surat.keterangan || '-'}</td>
									<td class="px-4 py-3 text-center align-middle">
										{#if surat.file_url}
											<a 
												href={surat.file_url} 
												target="_blank" 
												onclick={(e) => e.stopPropagation()}
												class="inline-flex items-center justify-center p-1.5 text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors" 
												title="Lihat Dokumen"
											>
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
	
	<!-- FAB for mobile -->
	{#if auth.isOperator}
	<button 
		class="fixed bottom-24 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30 transition-transform hover:scale-105 active:scale-95 z-[60]"
		onclick={() => goto('/arsip/keluar/tambah')}
	>
		<Plus size={24} strokeWidth={2.5} />
	</button>
	{/if}
</div>
