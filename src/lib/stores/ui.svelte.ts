export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
	id: number;
	type: ToastType;
	message: string;
}

export interface ConfirmOptions {
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel?: () => void;
}

class UIState {
	toasts = $state<Toast[]>([]);
	confirmDialog = $state<ConfirmOptions | null>(null);
	private nextId = 0;

	addToast(message: string, type: ToastType = 'info', durationMs: number = 4000) {
		const id = this.nextId++;
		this.toasts.push({ id, type, message });
		
		if (durationMs > 0) {
			setTimeout(() => {
				this.removeToast(id);
			}, durationMs);
		}
	}

	removeToast(id: number) {
		this.toasts = this.toasts.filter(t => t.id !== id);
	}

	showConfirm(options: ConfirmOptions) {
		this.confirmDialog = options;
	}

	closeConfirm() {
		this.confirmDialog = null;
	}
}

// Singleton global instance
export const ui = new UIState();
