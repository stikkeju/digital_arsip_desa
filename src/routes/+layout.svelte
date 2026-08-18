<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Inbox, Send, LayoutDashboard, Settings } from '@lucide/svelte';
	import ToastProvider from '$lib/components/ui/ToastProvider.svelte';
	import ConfirmModal from '$lib/components/ui/ConfirmModal.svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { ui } from '$lib/stores/ui.svelte';
	
	let { children } = $props();
	let currentPath = $derived(page.url.pathname);

	$effect(() => {
		if (!auth.loading) {
			if (!auth.user && currentPath !== '/login') {
				goto('/login');
			} else if (auth.user && currentPath === '/login') {
				goto('/');
			} else if (auth.user && !auth.isOperator && currentPath.includes('/tambah')) {
				ui.addToast('Akses ditolak: Anda hanya dapat melihat arsip', 'error');
				goto('/');
			}
		}
	});
</script>

<div class="flex h-screen flex-col bg-slate-50">
	<!-- Main Content Area -->
	<main class="flex-1 overflow-y-auto {currentPath === '/login' ? '' : 'pb-24'}">
		{#if auth.loading}
			<div class="flex h-full items-center justify-center">
				<div class="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
			</div>
		{:else}
			{@render children()}
		{/if}
	</main>

	<ToastProvider />
	<ConfirmModal />

	<!-- Bottom Navigation (Mobile-First) -->
	{#if currentPath !== '/login' && !auth.loading}
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

			<a
				href="/pengaturan"
				class="flex w-full flex-col items-center justify-center space-y-1 rounded-xl py-2 transition-all {currentPath.startsWith('/pengaturan')
					? 'text-purple-600 scale-105'
					: 'text-slate-400 hover:text-slate-700 active:scale-95'}"
			>
				<Settings
					size={24}
					strokeWidth={currentPath.startsWith('/pengaturan') ? 2.5 : 2}
				/>
				<span class="text-[10px] font-bold">Pengaturan</span>
			</a>
		</div>
	</nav>
	{/if}
</div>

<style>
	/* SafeArea padding for modern mobile devices */
	.pb-safe {
		padding-bottom: env(safe-area-inset-bottom);
	}
</style>
