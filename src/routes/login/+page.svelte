<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';
	import { ui } from '$lib/stores/ui.svelte.ts';
	import { auth } from '$lib/stores/auth.svelte.ts';
	import { Loader2, Lock, Mail } from '@lucide/svelte';

	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);

	async function handleLogin(e: Event) {
		e.preventDefault();
		isLoading = true;

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		isLoading = false;

		if (error) {
			ui.addToast('Gagal masuk: ' + error.message, 'error');
		} else {
			ui.addToast('Berhasil masuk ke sistem!', 'success');
			goto('/');
		}
	}
</script>

<div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-4">
	<!-- Background Gradients (Kabupaten Tangerang colors: Purple & Yellow) -->
	<div class="absolute -left-20 top-20 h-72 w-72 rounded-full bg-purple-300 opacity-20 blur-3xl mix-blend-multiply"></div>
	<div class="absolute -right-20 top-40 h-72 w-72 rounded-full bg-amber-300 opacity-20 blur-3xl mix-blend-multiply"></div>
	<div class="absolute -bottom-20 left-40 h-72 w-72 rounded-full bg-blue-300 opacity-20 blur-3xl mix-blend-multiply"></div>

	<!-- Login Card -->
	<div class="relative w-full max-w-sm rounded-3xl border border-white/40 bg-white/70 p-8 shadow-2xl backdrop-blur-xl">
		<div class="mb-10 text-center">
			<img
				src="/logo-tangerang.png"
				alt="Logo Kabupaten Tangerang"
				class="mx-auto mb-6 h-20 w-auto drop-shadow-md"
				onerror={(e) => ((e.currentTarget as HTMLElement).style.display = 'none')}
			/>
			<h1 class="mb-1 text-2xl font-black tracking-tight text-slate-900">
				Sistem Informasi Kearsipan
			</h1>
			<p class="text-sm font-medium text-slate-500">Pemerintah Desa Klutuk</p>
		</div>

		<form onsubmit={handleLogin} class="space-y-5">
			<div class="space-y-1">
				<label for="email" class="text-xs font-bold uppercase tracking-wider text-slate-500">Email Pegawai</label>
				<div class="relative">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
						<Mail size={18} />
					</div>
					<input
						id="email"
						type="email"
						bind:value={email}
						required
						disabled={isLoading}
						class="w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 disabled:opacity-50"
						placeholder="nama@desaklutuk.id"
					/>
				</div>
			</div>

			<div class="space-y-1">
				<label for="password" class="text-xs font-bold uppercase tracking-wider text-slate-500">Kata Sandi</label>
				<div class="relative">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
						<Lock size={18} />
					</div>
					<input
						id="password"
						type="password"
						bind:value={password}
						required
						disabled={isLoading}
						class="w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 disabled:opacity-50"
						placeholder="••••••••"
					/>
				</div>
			</div>

			<div class="pt-4">
				<button
					type="submit"
					disabled={isLoading}
					class="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-purple-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/40 active:translate-y-0 disabled:pointer-events-none disabled:opacity-70"
				>
					{#if isLoading}
						<Loader2 size={18} class="animate-spin" />
						Mengautentikasi...
					{:else}
						Masuk ke Sistem
					{/if}
				</button>
			</div>
		</form>

		<div class="mt-8 text-center">
			<p class="text-[11px] font-medium text-slate-400">
				© 2026 Pemerintah Desa Klutuk<br />Kabupaten Tangerang
			</p>
		</div>
	</div>
</div>
