<script lang="ts">
	import { Search, Filter, Plus, Send, ChevronRight } from '@lucide/svelte';

	// Dummy data for visual mock
	const dummySuratKeluar = [
		{
			id: 1,
			noRegister: '101/RK/2026',
			tanggalKirim: '10-08-2026',
			tujuan: 'Kecamatan Sukamaju',
			perihal: 'Laporan Pertanggungjawaban Dana Desa',
		},
		{
			id: 2,
			noRegister: '102/RK/2026',
			tanggalKirim: '13-08-2026',
			tujuan: 'Dinas Kependudukan',
			perihal: 'Pengajuan Blangko KTP',
		}
	];
</script>

<div class="space-y-4">
	<!-- Actions Bar -->
	<div class="flex items-center gap-2">
		<div class="relative flex-1">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
			<input 
				type="text" 
				placeholder="Cari surat..." 
				class="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
			/>
		</div>
		<button class="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50">
			<Filter size={20} />
		</button>
	</div>

	<!-- List -->
	<div class="space-y-3">
		{#each dummySuratKeluar as surat}
			<div class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm active:bg-slate-50">
				<div class="flex items-start justify-between gap-2">
					<div class="flex-1 space-y-1">
						<div class="flex items-center gap-2">
							<span class="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
								{surat.noRegister}
							</span>
							<span class="text-xs text-slate-500">{surat.tanggalKirim}</span>
						</div>
						<h3 class="font-medium text-slate-800 leading-tight">{surat.perihal}</h3>
						<p class="text-sm text-slate-600 flex items-center gap-1">
							<Send size={14} class="text-slate-400"/>
							{surat.tujuan}
						</p>
					</div>
					<button class="text-slate-400 hover:text-slate-600 self-center">
						<ChevronRight size={20} />
					</button>
				</div>
			</div>
		{/each}
	</div>

	<!-- FAB (Floating Action Button) -->
	<button class="fixed bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30 transition-transform active:scale-95">
		<Plus size={28} />
	</button>
</div>
