<script lang="ts">
	import { Search, Filter, Plus, FileText, ChevronRight, LayoutGrid, List, FileBadge } from '@lucide/svelte';

	// Dapatkan data dari +page.ts (Supabase)
	let { data } = $props();
	let arsipMasuk = $derived(data.arsipMasuk || []);

	// View toggle state
	let viewMode: 'card' | 'table' = $state('card');

	// Helper format Date JS (YYYY-MM-DD) to ID locale string
	function formatDate(dateStr: string | null) {
		if (!dateStr) return '-';
		try {
			const d = new Date(dateStr);
			return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
		} catch (e) {
			return dateStr;
		}
	}
</script>

<div class="space-y-4">
	<!-- Actions Bar -->
	<div class="flex items-center gap-2">
		<div class="relative flex-1">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
			<input 
				type="text" 
				placeholder="Cari surat masuk..." 
				class="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
			/>
		</div>
		<button class="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50">
			<Filter size={20} />
		</button>
		
		<!-- View Toggle -->
		<div class="flex rounded-xl border border-slate-200 bg-white p-1">
			<button 
				class="rounded-lg p-1.5 transition-colors {viewMode === 'card' ? 'bg-primary-50 text-primary-600' : 'text-slate-400 hover:text-slate-600'}"
				onclick={() => viewMode = 'card'}
			>
				<LayoutGrid size={18} />
			</button>
			<button 
				class="rounded-lg p-1.5 transition-colors {viewMode === 'table' ? 'bg-primary-50 text-primary-600' : 'text-slate-400 hover:text-slate-600'}"
				onclick={() => viewMode = 'table'}
			>
				<List size={18} />
			</button>
		</div>
	</div>

	<!-- Content View -->
	{#if viewMode === 'card'}
		<!-- Card List -->
		<div class="space-y-3">
			{#if arsipMasuk.length === 0}
				<div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
					Belum ada data arsip surat masuk.
				</div>
			{/if}

			{#each arsipMasuk as surat}
				<div class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm active:bg-slate-50 relative">
					{#if surat.file_url}
						<!-- Badge file digital tersedia -->
						<div class="absolute right-4 top-4 text-blue-600" title="Dokumen digital tersedia">
							<FileBadge size={20} />
						</div>
					{/if}
					
					<div class="flex items-start justify-between gap-2">
						<div class="flex-1 space-y-2">
							<div class="flex items-center gap-2 flex-wrap pr-8">
								<span class="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
									Reg: {surat.no_register}
								</span>
								<span class="text-xs text-slate-500 ml-auto">{formatDate(surat.tanggal_terima)}</span>
							</div>
							<h3 class="font-medium text-slate-800 leading-tight">{surat.perihal || '-'}</h3>
							<div class="space-y-1">
								<p class="text-sm text-slate-600 flex items-center gap-1">
									<FileText size={14} class="text-slate-400 flex-shrink-0"/>
									<span class="truncate">{surat.pengirim || '-'}</span>
								</p>
								<p class="text-xs text-slate-500">Keterangan: <span class="font-medium text-slate-700">{surat.keterangan || '-'}</span></p>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Table View -->
		<div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
			<table class="w-full text-left text-sm text-slate-600">
				<thead class="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
					<tr>
						<th class="px-4 py-3 font-semibold whitespace-nowrap">File</th>
						<th class="px-4 py-3 font-semibold whitespace-nowrap">No. Reg</th>
						<th class="px-4 py-3 font-semibold whitespace-nowrap">Tgl. Terima</th>
						<th class="px-4 py-3 font-semibold min-w-[200px]">Pengirim</th>
						<th class="px-4 py-3 font-semibold min-w-[250px]">Perihal</th>
						<th class="px-4 py-3 font-semibold whitespace-nowrap">Ket</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#if arsipMasuk.length === 0}
						<tr>
							<td colspan="6" class="px-4 py-8 text-center text-slate-500">
								Belum ada data arsip surat masuk.
							</td>
						</tr>
					{/if}

					{#each arsipMasuk as surat}
						<tr class="hover:bg-slate-50">
							<td class="px-4 py-3">
								{#if surat.file_url}
									<a href={surat.file_url} target="_blank" class="text-blue-600 hover:text-blue-700" title="Lihat Dokumen">
										<FileBadge size={18} />
									</a>
								{:else}
									<span class="text-slate-300">-</span>
								{/if}
							</td>
							<td class="px-4 py-3 font-medium text-slate-800">{surat.no_register}</td>
							<td class="px-4 py-3 whitespace-nowrap">{formatDate(surat.tanggal_terima)}</td>
							<td class="px-4 py-3">{surat.pengirim || '-'}</td>
							<td class="px-4 py-3 font-medium text-slate-700">{surat.perihal || '-'}</td>
							<td class="px-4 py-3">{surat.keterangan || '-'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<!-- FAB -->
	<a href="/arsip/masuk/tambah" class="fixed bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30 transition-transform active:scale-95 hover:bg-primary-700">
		<Plus size={28} />
	</a>
</div>
