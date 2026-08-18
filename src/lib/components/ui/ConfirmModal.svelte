<script lang="ts">
	import { ui } from '$lib/stores/ui.svelte';
	import { AlertTriangle, X } from '@lucide/svelte';
	import { fade, scale } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';

	// Handle escape key to close
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && ui.confirmDialog) {
			handleCancel();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('keydown', handleKeydown);
		}
	});

	function handleConfirm() {
		if (ui.confirmDialog) {
			ui.confirmDialog.onConfirm();
			ui.closeConfirm();
		}
	}

	function handleCancel() {
		if (ui.confirmDialog) {
			if (ui.confirmDialog.onCancel) {
				ui.confirmDialog.onCancel();
			}
			ui.closeConfirm();
		}
	}
</script>

{#if ui.confirmDialog}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div 
		class="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
		in:fade={{ duration: 200 }}
		out:fade={{ duration: 150 }}
		onclick={handleCancel}
	>
		<div 
			class="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/5"
			in:scale={{ start: 0.95, duration: 200 }}
			out:scale={{ start: 0.95, duration: 150 }}
			onclick={(e) => e.stopPropagation()}
		>
			<button 
				class="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
				onclick={handleCancel}
			>
				<X size={20} />
			</button>

			<div class="p-6 pb-0">
				<div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
					<AlertTriangle size={24} strokeWidth={2.5} />
				</div>
				<h3 class="mb-2 text-lg font-bold text-slate-900">
					{ui.confirmDialog.title}
				</h3>
				<p class="text-sm leading-relaxed text-slate-500">
					{ui.confirmDialog.message}
				</p>
			</div>

			<div class="mt-8 flex gap-3 bg-slate-50 p-6">
				<button 
					class="flex-1 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
					onclick={handleCancel}
				>
					{ui.confirmDialog.cancelText || 'Batal'}
				</button>
				<button 
					class="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
					onclick={handleConfirm}
				>
					{ui.confirmDialog.confirmText || 'Ya, Lanjutkan'}
				</button>
			</div>
		</div>
	</div>
{/if}
