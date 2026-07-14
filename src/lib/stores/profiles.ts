import { writable } from 'svelte/store';
import type { Channel } from './settings';

export type Profile = {
	name: string;
	favorites: string[];   // channel identifiers
	hidden: string[];      // channel identifiers
	mode: 'kids' | 'normal' | 'adult';
};

const STORAGE_KEY = 'tube-surf-profiles';

function loadProfiles(): Record<string, Profile> {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}

function saveProfiles(profiles: Record<string, Profile>) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export const profiles = writable<Record<string, Profile>>(loadProfiles());

export function toggleFavorite(channelId: string, profileName: string) {
	profiles.update((p) => {
		const profile = p[profileName];
		if (!profile) return p;
		if (profile.favorites.includes(channelId)) {
			profile.favorites = profile.favorites.filter((id) => id !== channelId);
		} else {
			profile.favorites = [...profile.favorites, channelId];
		}
		saveProfiles(p);
		return p;
	});
}

export function toggleHidden(channelId: string, profileName: string) {
	profiles.update((p) => {
		const profile = p[profileName];
		if (!profile) return p;
		if (profile.hidden.includes(channelId)) {
			profile.hidden = profile.hidden.filter((id) => id !== channelId);
		} else {
			profile.hidden = [...profile.hidden, channelId];
		}
		saveProfiles(p);
		return p;
	});
}
