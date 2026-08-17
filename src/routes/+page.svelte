<script lang="ts">
	import { FileText, Archive, Clock } from '@lucide/svelte';
	
	let { data } = $props();
</script>

<!-- Custom Header for Beranda -->
<header class="bg-white px-4 py-4 shadow-sm flex items-center justify-between">
	<h1 class="text-xl font-bold tracking-tight text-slate-800">
		Digital Arsip
	</h1>
	<span class="text-xs font-semibold bg-primary-100 text-primary-700 px-2 py-1 rounded-full">Desa</span>
</header>

<div class="space-y-6 p-4">
	<!-- Hero Section -->
	<section class="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 p-6 text-white shadow-lg shadow-primary-600/20">
		<h2 class="text-2xl font-bold">Selamat Datang!</h2>
		<p class="mt-2 text-primary-50 text-sm leading-relaxed">Kelola dan telusuri arsip desa dengan mudah dan cepat tanpa ribet.</p>
	</section>

	<!-- Quick Stats -->
	<section class="grid grid-cols-2 gap-4">
		<div class="flex flex-col items-center justify-center space-y-3 rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
			<div class="rounded-full bg-blue-50 p-3 text-blue-600">
				<Archive size={28} strokeWidth={1.5} />
			</div>
			<div class="text-center">
				<p class="text-4xl font-black text-slate-800 tracking-tight">{data.countMasuk}</p>
				<p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Surat Masuk</p>
			</div>
		</div>

		<div class="flex flex-col items-center justify-center space-y-3 rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
			<div class="rounded-full bg-green-50 p-3 text-green-600">
				<FileText size={28} strokeWidth={1.5} />
			</div>
			<div class="text-center">
				<p class="text-4xl font-black text-slate-800 tracking-tight">{data.countKeluar}</p>
				<p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Surat Keluar</p>
			</div>
		</div>
	</section>

	<!-- Recent Activity (Static mock for now) -->
	<section class="space-y-4">
		<h3 class="font-semibold text-slate-700 flex items-center gap-2">
			<Clock size={18} />
			Informasi Sistem
		</h3>
		
		<div class="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
			<p class="text-sm text-slate-600">
				Database telah berhasil dihubungkan ke Supabase.
				Terdapat total <strong>{data.countMasuk + data.countKeluar}</strong> arsip yang dikelola secara digital.
			</p>
		</div>
	</section>
</div>
