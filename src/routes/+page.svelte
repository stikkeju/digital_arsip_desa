<script lang="ts">
	import { FileText, Archive, Clock, CalendarDays, BarChart3 } from '@lucide/svelte';
	
	let { data } = $props();

	let arsipMasuk = $derived(data.arsipMasuk || []);
	let arsipKeluar = $derived(data.arsipKeluar || []);

	let timeFilter = $state('all'); // 'all', 'today', '7days', 'month', 'year'

	function isDateInRange(dateStr: string | null, filter: string) {
		if (!dateStr) return false; // If no date, exclude from time filters except 'all'
		if (filter === 'all') return true;
		
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

	let filteredMasuk = $derived(arsipMasuk.filter(s => isDateInRange(s.tanggal_terima, timeFilter)));
	let filteredKeluar = $derived(arsipKeluar.filter(s => isDateInRange(s.tanggal_pembuatan, timeFilter)));

	let countMasuk = $derived(filteredMasuk.length);
	let countKeluar = $derived(filteredKeluar.length);

	function groupPerihal(arr: any[]) {
		const groups: Record<string, number> = {};
		arr.forEach(s => {
			if (!s.perihal) return;
			// Normalize
			const raw = s.perihal.toLowerCase().trim();
			// Capitalize first letter of each word
			const normalized = raw.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
			if (!groups[normalized]) groups[normalized] = 0;
			groups[normalized]++;
		});
		
		return Object.entries(groups)
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count); // sort descending by count
	}

	let kategoriMasuk = $derived(groupPerihal(filteredMasuk));
	let kategoriKeluar = $derived(groupPerihal(filteredKeluar));
</script>

<!-- Custom Header for Beranda -->
<header class="bg-white px-4 py-4 shadow-sm flex items-center justify-between">
	<h1 class="text-xl font-bold tracking-tight text-slate-800">
		Digital Arsip
	</h1>
	<span class="text-xs font-semibold bg-primary-100 text-primary-700 px-2 py-1 rounded-full">Desa</span>
</header>

<div class="space-y-6 p-4 pb-8">
	<!-- Hero Section -->
	<section class="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 p-6 text-white shadow-lg shadow-primary-600/20">
		<h2 class="text-2xl font-bold leading-snug">Selamat Datang di<br/>Sistem Informasi Arsip Digital</h2>
		<p class="mt-2 text-primary-50 text-sm leading-relaxed opacity-90">Desa Klutuk, Kec. Mekar Baru, Kab. Tangerang</p>
	</section>

	<!-- Filter Action -->
	<section class="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
		<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 shrink-0">
			<CalendarDays size={20} />
		</div>
		<div class="flex-1">
			<select bind:value={timeFilter} class="w-full bg-transparent text-sm font-semibold text-slate-700 focus:outline-none appearance-none cursor-pointer">
				<option value="all">Menampilkan: Semua Waktu</option>
				<option value="today">Menampilkan: Hari Ini</option>
				<option value="7days">Menampilkan: 7 Hari Terakhir</option>
				<option value="month">Menampilkan: Bulan Ini</option>
				<option value="year">Menampilkan: Tahun Ini</option>
			</select>
		</div>
	</section>

	<!-- Quick Stats -->
	<section class="grid grid-cols-2 gap-4">
		<div class="flex flex-col items-center justify-center space-y-3 rounded-2xl bg-white p-5 shadow-sm border border-slate-100 relative overflow-hidden group">
			<div class="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform">
				<Archive size={80} />
			</div>
			<div class="rounded-full bg-blue-50 p-3 text-blue-600 relative z-10">
				<Archive size={28} strokeWidth={1.5} />
			</div>
			<div class="text-center relative z-10">
				<p class="text-4xl font-black text-slate-800 tracking-tight">{countMasuk}</p>
				<p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Surat Masuk</p>
			</div>
		</div>

		<div class="flex flex-col items-center justify-center space-y-3 rounded-2xl bg-white p-5 shadow-sm border border-slate-100 relative overflow-hidden group">
			<div class="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform">
				<FileText size={80} />
			</div>
			<div class="rounded-full bg-green-50 p-3 text-green-600 relative z-10">
				<FileText size={28} strokeWidth={1.5} />
			</div>
			<div class="text-center relative z-10">
				<p class="text-4xl font-black text-slate-800 tracking-tight">{countKeluar}</p>
				<p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Surat Keluar</p>
			</div>
		</div>
	</section>

	<!-- Category Tables -->
	<section class="space-y-4">
		<h3 class="font-bold text-slate-800 flex items-center gap-2">
			<BarChart3 size={20} class="text-primary-600" />
			Kategori Surat (Berdasarkan Perihal)
		</h3>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<!-- Tabel Masuk -->
			<div class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
				<div class="bg-blue-50/50 px-4 py-3 border-b border-slate-100">
					<h4 class="font-semibold text-blue-800 text-sm flex items-center gap-2">
						<Archive size={16} />
						Rekap Surat Masuk
					</h4>
				</div>
				<div class="p-0">
					{#if kategoriMasuk.length === 0}
						<p class="text-sm text-slate-500 p-6 text-center italic">Belum ada data pada rentang waktu ini.</p>
					{:else}
						<ul class="divide-y divide-slate-100">
							{#each kategoriMasuk as kat}
								<li>
									<a href="/arsip/masuk?q={encodeURIComponent(kat.name)}&time={timeFilter}" class="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
										<span class="text-sm font-medium text-slate-700 truncate pr-4">{kat.name}</span>
										<span class="inline-flex items-center justify-center min-w-8 h-6 px-2 text-xs font-bold text-blue-700 bg-blue-100 rounded-full">{kat.count}</span>
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>

			<!-- Tabel Keluar -->
			<div class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
				<div class="bg-green-50/50 px-4 py-3 border-b border-slate-100">
					<h4 class="font-semibold text-green-800 text-sm flex items-center gap-2">
						<FileText size={16} />
						Rekap Surat Keluar
					</h4>
				</div>
				<div class="p-0">
					{#if kategoriKeluar.length === 0}
						<p class="text-sm text-slate-500 p-6 text-center italic">Belum ada data pada rentang waktu ini.</p>
					{:else}
						<ul class="divide-y divide-slate-100">
							{#each kategoriKeluar as kat}
								<li>
									<a href="/arsip/keluar?q={encodeURIComponent(kat.name)}&time={timeFilter}" class="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
										<span class="text-sm font-medium text-slate-700 truncate pr-4">{kat.name}</span>
										<span class="inline-flex items-center justify-center min-w-8 h-6 px-2 text-xs font-bold text-green-700 bg-green-100 rounded-full">{kat.count}</span>
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>
		</div>
	</section>
</div>
