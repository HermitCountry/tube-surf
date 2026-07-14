import { writable } from 'svelte/store';

export type ContentMode = 'kids' | 'normal' | 'adult';
export type Channel = {
	id: string;
	name: string;
	collection: string;
	identifier?: string;   // IA identifier or direct HLS/MP4 URL
	description?: string;
	favorited: boolean;
	hidden: boolean;
};

/** Current content mode */
export const mode = writable<ContentMode>('normal');

/** List of channels in the current guide */
export const channels = writable<Channel[]>([]);

/** Currently selected channel index */
export const activeChannel = writable<number>(0);

/** Whether kids mode is locked (needs parent gate to exit) */
export const kidsLocked = writable<boolean>(false);

/** Current profile name */
export const activeProfile = writable<string>('Default');
