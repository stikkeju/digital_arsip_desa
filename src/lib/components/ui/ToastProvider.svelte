<script lang="ts">
	import { ui } from '$lib/stores/ui.svelte';
	import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from '@lucide/svelte';
	import { fly, fade } from 'svelte/transition';

	function getIcon(type: string) {
		switch (type) {
			case 'success': return CheckCircle2;
			case 'error': return AlertCircle;
			case 'warning': return AlertTriangle;
			default: return Info;
		}
	}

	function getColors(type: string) {
		switch (type) {
			case 'success': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
			case 'error': return 'bg-red-50 border-red-200 text-red-800';
			case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800';
			default: return 'bg-blue-50 border-blue-200 text-blue-800';
		}
	}

	function getIconColor(type: string) {
		switch (type) {
			case 'success': return 'text-emerald-500';
			case 'error': return 'text-red-500';
			case 'warning': return 'text-amber-500';
			default: return 'text-blue-500';
		}
	}
</script>

<div class="fixed top-4 left-0 right-0 z-[9999] flex flex-col items-center gap-2 pointer-events-none px-4">
	{#each ui.toasts as toast (toast.id)}
		{@const Icon = getIcon(toast.type)}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div 
			in:fly={{ y: -20, duration: 300 }} 
			out:fade={{ duration: 200 }}
			class="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur-sm {getColors(toast.type)}"
			onclick={() => ui.removeToast(toast.id)}
		>
			<div class="shrink-0 {getIconColor(toast.type)}">
				<Icon size={20} />
			</div>
			<p class="flex-1 text-sm font-medium leading-relaxed">{toast.message}</p>
			<button class="shrink-0 text-slate-400 hover:text-slate-600 transition-colors" onclick={(e) => { e.stopPropagation(); ui.removeToast(toast.id); }}>
				<X size={16} />
			</button>
		</div>
	{/each}
</div>
