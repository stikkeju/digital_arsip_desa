import { supabase } from '$lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface Profile {
	id: string;
	role: 'operator' | 'viewer';
	full_name: string | null;
}

class AuthState {
	user = $state<User | null>(null);
	profile = $state<Profile | null>(null);
	loading = $state(true);

	constructor() {
		// Only run in browser
		if (typeof window !== 'undefined') {
			this.initialize();
		}
	}

	async initialize() {
		this.loading = true;
		
		// Dapatkan sesi saat ini
		const { data: { session } } = await supabase.auth.getSession();
		
		if (session) {
			this.user = session.user;
			await this.fetchProfile(session.user.id);
		}
		
		this.loading = false;

		// Listen ke perubahan status auth (login/logout)
		supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
				this.user = session?.user || null;
				if (this.user) {
					await this.fetchProfile(this.user.id);
				}
			} else if (event === 'SIGNED_OUT') {
				this.user = null;
				this.profile = null;
			}
			
			// Jika loading masih true (misal event fired cepat), set false
			this.loading = false;
		});
	}

	private async fetchProfile(userId: string) {
		const { data, error } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', userId)
			.single();
			
		if (!error && data) {
			this.profile = data as Profile;
		}
	}

	get isOperator() {
		return this.profile?.role === 'operator';
	}
	
	async signOut() {
		await supabase.auth.signOut();
	}
}

export const auth = new AuthState();
