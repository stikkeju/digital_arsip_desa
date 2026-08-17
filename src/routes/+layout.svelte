<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { Inbox, Send, LayoutDashboard } from '@lucide/svelte';
	
	let { children } = $props();
	let currentPath = $derived(page.url.pathname);
</script>

<div class="flex h-screen flex-col bg-slate-50">
	<!-- Main Content Area -->
	<!-- Removed the static header so each page can define its own beautiful custom header -->
	<main class="flex-1 overflow-y-auto pb-24">
		{@render children()}
	</main>

	<!-- Bottom Navigation (Mobile-First) -->
	<nav class="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/90 backdrop-blur-md pb-safe">
		<div class="mx-auto flex max-w-md justify-around p-2">
			<a
				href="/"
				class="flex w-full flex-col items-center justify-center space-y-1 rounded-xl py-2 transition-all {currentPath === '/'
					? 'text-primary-600 scale-105'
					: 'text-slate-400 hover:text-slate-700 active:scale-95'}"
			>
				<LayoutDashboard size={24} strokeWidth={currentPath === '/' ? 2.5 : 2} />
				<span class="text-[10px] font-bold">Beranda</span>
			</a>

			<a
				href="/arsip/masuk"
				class="flex w-full flex-col items-center justify-center space-y-1 rounded-xl py-2 transition-all {currentPath.startsWith('/arsip/masuk')
					? 'text-blue-600 scale-105'
					: 'text-slate-400 hover:text-slate-700 active:scale-95'}"
			>
				<Inbox
					size={24}
					strokeWidth={currentPath.startsWith('/arsip/masuk') ? 2.5 : 2}
				/>
				<span class="text-[10px] font-bold">Masuk</span>
			</a>

			<a
				href="/arsip/keluar"
				class="flex w-full flex-col items-center justify-center space-y-1 rounded-xl py-2 transition-all {currentPath.startsWith('/arsip/keluar')
					? 'text-green-600 scale-105'
					: 'text-slate-400 hover:text-slate-700 active:scale-95'}"
			>
				<Send
					size={24}
					strokeWidth={currentPath.startsWith('/arsip/keluar') ? 2.5 : 2}
				/>
				<span class="text-[10px] font-bold">Keluar</span>
			</a>
		</div>
	</nav>
</div>

<style>
	/* SafeArea padding for modern mobile devices */
	.pb-safe {
		padding-bottom: env(safe-area-inset-bottom);
	}
</style>
