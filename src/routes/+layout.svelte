<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { Inbox, Send, LayoutDashboard } from '@lucide/svelte';
	
	let { children } = $props();

	let currentPath = $derived(page.url.pathname);
</script>

<div class="flex h-screen flex-col bg-slate-50">
	<!-- Top App Bar (Optional, can be used for title or back button later) -->
	<header class="bg-white px-4 py-4 shadow-sm">
		<h1 class="text-xl font-bold tracking-tight text-slate-800">
			{#if currentPath === '/arsip/masuk'}
				Surat Masuk
			{:else if currentPath === '/arsip/keluar'}
				Surat Keluar
			{:else}
				Digital Arsip
			{/if}
		</h1>
	</header>

	<!-- Main Content Area -->
	<main class="flex-1 overflow-y-auto p-4 pb-24">
		{@render children()}
	</main>

	<!-- Bottom Navigation (Mobile-First) -->
	<nav class="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white pb-safe">
		<div class="mx-auto flex max-w-md justify-around p-2">
			<a
				href="/"
				class="flex w-full flex-col items-center justify-center space-y-1 rounded-lg py-2 transition-colors {currentPath ===
				'/'
					? 'text-primary-600'
					: 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}"
			>
				<LayoutDashboard size={24} strokeWidth={currentPath === '/' ? 2.5 : 2} />
				<span class="text-xs font-medium">Beranda</span>
			</a>

			<a
				href="/arsip/masuk"
				class="flex w-full flex-col items-center justify-center space-y-1 rounded-lg py-2 transition-colors {currentPath.startsWith(
					'/arsip/masuk'
				)
					? 'text-primary-600'
					: 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}"
			>
				<Inbox
					size={24}
					strokeWidth={currentPath.startsWith('/arsip/masuk') ? 2.5 : 2}
				/>
				<span class="text-xs font-medium">Masuk</span>
			</a>

			<a
				href="/arsip/keluar"
				class="flex w-full flex-col items-center justify-center space-y-1 rounded-lg py-2 transition-colors {currentPath.startsWith(
					'/arsip/keluar'
				)
					? 'text-primary-600'
					: 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}"
			>
				<Send
					size={24}
					strokeWidth={currentPath.startsWith('/arsip/keluar') ? 2.5 : 2}
				/>
				<span class="text-xs font-medium">Keluar</span>
			</a>
		</div>
	</nav>
</div>

<style>
	/* SafeArea padding for modern mobile devices (e.g., iPhone Home Indicator) */
	.pb-safe {
		padding-bottom: env(safe-area-inset-bottom);
	}
</style>
