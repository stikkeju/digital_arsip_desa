<script lang="ts">
	import { FileText, Archive, Clock } from '@lucide/svelte';
</script>

<div class="space-y-6">
	<!-- Hero Section -->
	<section class="rounded-2xl bg-primary-600 p-6 text-white shadow-md">
		<h2 class="text-2xl font-bold">Selamat Datang, Operator!</h2>
		<p class="mt-2 text-primary-50">Kelola dan telusuri arsip desa dengan mudah dan cepat.</p>
	</section>

	<!-- Quick Stats -->
	<section class="grid grid-cols-2 gap-4">
		<div class="flex flex-col items-center justify-center space-y-2 rounded-xl bg-white p-4 shadow-sm border border-slate-100">
			<div class="rounded-full bg-blue-50 p-3 text-blue-600">
				<Archive size={24} />
			</div>
			<div class="text-center">
				<p class="text-3xl font-bold text-slate-800">124</p>
				<p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Surat Masuk</p>
			</div>
		</div>

		<div class="flex flex-col items-center justify-center space-y-2 rounded-xl bg-white p-4 shadow-sm border border-slate-100">
			<div class="rounded-full bg-green-50 p-3 text-green-600">
				<FileText size={24} />
			</div>
			<div class="text-center">
				<p class="text-3xl font-bold text-slate-800">85</p>
				<p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Surat Keluar</p>
			</div>
		</div>
	</section>

	<!-- Recent Activity -->
	<section class="space-y-4">
		<h3 class="font-semibold text-slate-700 flex items-center gap-2">
			<Clock size={18} />
			Aktivitas Terakhir
		</h3>
		
		<div class="space-y-3">
			{#each Array(3) as _, i}
				<div class="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm border border-slate-100">
					<div class="mt-1 h-2 w-2 rounded-full {i % 2 === 0 ? 'bg-blue-500' : 'bg-green-500'}"></div>
					<div>
						<p class="font-medium text-slate-800 text-sm">Surat Undangan Rapat Kecamatan</p>
						<p class="text-xs text-slate-500 mt-1">Ditambahkan 2 jam yang lalu</p>
					</div>
				</div>
			{/each}
		</div>
	</section>
</div>
