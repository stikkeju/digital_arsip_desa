<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte.ts';
	import { LogOut, User, Shield, KeyRound, ArrowLeft, Loader2, X } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { ui } from '$lib/stores/ui.svelte.ts';
	import { supabase } from '$lib/supabaseClient';

	let isLoggingOut = $state(false);
	let isChangingPassword = $state(false);
	let showPasswordForm = $state(false);
	let newPassword = $state('');
	let confirmPassword = $state('');

	async function handleUpdatePassword(e: Event) {
		e.preventDefault();
		
		if (newPassword.length < 6) {
			ui.addToast('Kata sandi minimal 6 karakter', 'error');
			return;
		}
		if (newPassword !== confirmPassword) {
			ui.addToast('Konfirmasi kata sandi tidak cocok', 'error');
			return;
		}

		isChangingPassword = true;
		const { error } = await supabase.auth.updateUser({ password: newPassword });
		isChangingPassword = false;

		if (error) {
			ui.addToast('Gagal mengubah kata sandi: ' + error.message, 'error');
		} else {
			ui.addToast('Kata sandi berhasil diubah!', 'success');
			showPasswordForm = false;
			newPassword = '';
			confirmPassword = '';
		}
	}

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

			<!-- System Settings -->
			<div class="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
				<div class="p-4">
					<h3 class="mb-4 text-sm font-bold text-slate-900">Keamanan</h3>
					
					{#if !showPasswordForm}
						<div class="space-y-2">
							<button 
								onclick={() => (showPasswordForm = true)}
								class="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors hover:bg-slate-50"
							>
								<div class="flex items-center gap-3 text-slate-700">
									<KeyRound size={20} class="text-slate-400" />
									<span class="font-medium">Ubah Kata Sandi</span>
								</div>
								<span class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Ubah</span>
							</button>
						</div>
					{:else}
						<form onsubmit={handleUpdatePassword} class="animate-in fade-in slide-in-from-top-2 rounded-xl bg-slate-50 p-4 border border-slate-100">
							<div class="flex items-center justify-between mb-4">
								<h4 class="text-sm font-semibold text-slate-800">Form Ubah Kata Sandi</h4>
								<button 
									type="button" 
									onclick={() => { showPasswordForm = false; newPassword = ''; confirmPassword = ''; }}
									class="p-1 text-slate-400 hover:text-slate-600 transition-colors"
								>
									<X size={16} />
								</button>
							</div>

							<div class="space-y-3">
								<div class="space-y-1">
									<label class="text-xs font-medium text-slate-600" for="new_password">Kata Sandi Baru</label>
									<input
										type="password"
										id="new_password"
										bind:value={newPassword}
										minlength="6"
										placeholder="Minimal 6 karakter"
										required
										class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
									/>
								</div>
								<div class="space-y-1">
									<label class="text-xs font-medium text-slate-600" for="confirm_password">Konfirmasi Kata Sandi</label>
									<input
										type="password"
										id="confirm_password"
										bind:value={confirmPassword}
										minlength="6"
										placeholder="Ketik ulang kata sandi"
										required
										class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
									/>
								</div>
								
								<div class="pt-2">
									<button
										type="submit"
										disabled={isChangingPassword}
										class="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-70"
									>
										{#if isChangingPassword}
											<Loader2 class="animate-spin" size={16} />
											Menyimpan...
										{:else}
											Simpan Kata Sandi Baru
										{/if}
									</button>
								</div>
							</div>
						</form>
					{/if}
				</div>
			</div>


			<!-- Tentang Aplikasi -->
			<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
				<h3 class="mb-4 text-sm font-bold tracking-tight text-slate-800">Tentang Aplikasi</h3>
				<div class="flex flex-col items-center justify-center space-y-4 rounded-xl bg-slate-50 p-6 text-center border border-slate-100">
					<div class="flex items-center justify-center gap-4">
						<img src="/images/logo-uniba.jpg" alt="Logo Uniba" class="h-14 w-auto rounded-full object-contain shadow-sm" />
						<img src="/images/logo-kkm.jpg" alt="Logo KKM 96" class="h-14 w-auto rounded-full object-contain shadow-sm" />
					</div>
					<div>
						<h4 class="font-bold text-slate-800 text-sm">Sistem Informasi Digitalisasi Arsip Desa</h4>
						<p class="text-xs text-slate-500 mt-1">Pemerintah Desa Klutuk, Kec. Mekar Baru, Kab. Tangerang</p>
					</div>
					<div class="w-12 h-0.5 bg-slate-200 rounded-full"></div>
					<div>
						<p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
							Dibuat oleh: <br/> Tim KKM Kelompok 96 <br/> Universitas Bina Bangsa Tahun 2026
						</p>
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
