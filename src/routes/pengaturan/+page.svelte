<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte.ts';
	import { LogOut, User, Shield, KeyRound, ArrowLeft } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { ui } from '$lib/stores/ui.svelte.ts';

	let isLoggingOut = $state(false);

	function handleLogout() {
		ui.showConfirm({
			title: 'Konfirmasi Keluar',
			message: 'Apakah Anda yakin ingin keluar dari sistem?',
			confirmText: 'Ya, Keluar',
			cancelText: 'Batal',
			onConfirm: async () => {
				isLoggingOut = true;
				await auth.signOut();
				ui.addToast('Anda telah keluar dari sistem.', 'info');
				isLoggingOut = false;
				goto('/login');
			}
		});
	}
</script>

<div class="flex h-full flex-col bg-slate-50">
	<header class="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
		<button
			onclick={() => goto('/')}
			class="rounded-full p-1 text-slate-600 transition-colors hover:text-slate-900 active:bg-slate-100"
		>
			<ArrowLeft size={24} />
		</button>
		<h1 class="text-xl font-bold tracking-tight text-slate-800">Pengaturan</h1>
	</header>

	<main class="flex-1 overflow-y-auto p-4 pb-8">
		<div class="mx-auto max-w-2xl space-y-6">
			
			<!-- Profile Card -->
			<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
				<div class="border-b border-slate-100 bg-slate-50/50 p-6">
					<div class="flex items-center gap-4">
						<div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600">
							<User size={32} strokeWidth={2.5} />
						</div>
						<div>
							<h2 class="text-lg font-bold text-slate-900">
								{auth.profile?.full_name || 'Pengguna Sistem'}
							</h2>
							<p class="text-sm font-medium text-slate-500">{auth.user?.email}</p>
						</div>
					</div>
				</div>
				
				<div class="p-6">
					<div class="flex items-center justify-between rounded-xl bg-slate-50 p-4">
						<div class="flex items-center gap-3 text-slate-700">
							<Shield size={20} class="text-indigo-500" />
							<div>
								<p class="text-xs font-bold uppercase tracking-wider text-slate-500">Tingkat Akses</p>
								<p class="font-semibold capitalize">{auth.profile?.role || 'Viewer'}</p>
							</div>
						</div>
						<div class="text-right text-xs font-medium text-slate-400">
							{auth.isOperator ? 'Akses Penuh (Edit/Hapus)' : 'Hanya Lihat (Read-Only)'}
						</div>
					</div>
				</div>
			</div>

			<!-- System Settings (Placeholder) -->
			<div class="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
				<div class="p-4">
					<h3 class="mb-4 text-sm font-bold text-slate-900">Preferensi Sistem</h3>
					<div class="space-y-2">
						<button class="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors hover:bg-slate-50">
							<div class="flex items-center gap-3 text-slate-700">
								<KeyRound size={20} class="text-slate-400" />
								<span class="font-medium">Ubah Kata Sandi</span>
							</div>
							<span class="text-xs font-medium text-slate-400">Segera hadir</span>
						</button>
					</div>
				</div>
			</div>

			<!-- Danger Zone -->
			<div class="pt-4">
				<button
					onclick={handleLogout}
					disabled={isLoggingOut}
					class="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3.5 text-sm font-bold tracking-wide text-red-600 transition-colors hover:bg-red-100 active:bg-red-200 disabled:opacity-50"
				>
					<LogOut size={18} />
					{isLoggingOut ? 'Keluar...' : 'Keluar dari Sistem'}
				</button>
			</div>
			
			<div class="pt-6 text-center">
				<p class="text-xs font-medium text-slate-400">Digital Arsip Desa Klutuk v1.0.0</p>
			</div>

		</div>
	</main>
</div>
