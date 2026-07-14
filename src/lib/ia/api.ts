/**
 * Internet Archive API helpers for tube-surf.
 *
 * References:
 *   https://archive.org/details/tvarchive          — timestamped TV broadcasts
 *   https://archive.org/details/vhsvault           — VHS rips
 *   https://archive.org/details/vhskids            — Kids' VHS
 *   https://archive.org/details/prelinger          — Educational/industrial films
 *   https://archive.org/details/classic_tv         — Classic TV shows
 */

export interface IAItem {
	identifier: string;
	title: string;
	description?: string;
	collection?: string[];
	creator?: string;
	date?: string;
	year?: string;
	/** Direct MP4 URL (choose the largest variant) */
	videoUrl?: string;
}

export interface IASearchResult {
	items: IAItem[];
	total: number;
}

/**
 * Search the Internet Archive for items in a given collection.
 */
export async function searchCollection(
	collection: string,
	query: string = '',
	limit: number = 50
): Promise<IASearchResult> {
	const q = query
		? `collection:${collection} AND ${query}`
		: `collection:${collection}`;

	const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}&fl[]=identifier&fl[]=title&fl[]=description&fl[]=collection&fl[]=creator&fl[]=date&fl[]=year&rows=${limit}&output=json`;

	const res = await fetch(url);
	const data = await res.json();
	const items: IAItem[] = (data.response?.docs ?? []).map((doc: any) => ({
		identifier: doc.identifier,
		title: doc.title,
		description: doc.description,
		collection: doc.collection,
		creator: doc.creator,
		date: doc.date,
		year: doc.year,
		videoUrl: `https://archive.org/download/${doc.identifier}/${doc.identifier}.mp4`
	}));

	return { items, total: data.response?.numFound ?? 0 };
}

/**
 * Get metadata for a specific IA item by identifier.
 */
export async function getItemMetadata(identifier: string): Promise<IAItem | null> {
	const url = `https://archive.org/metadata/${encodeURIComponent(identifier)}`;

	const res = await fetch(url);
	if (!res.ok) return null;

	const data = await res.json();
	const item = data.metadata;

	return {
		identifier: item.identifier,
		title: item.title,
		description: item.description,
		collection: item.collection,
		creator: item.creator,
		date: item.date,
		year: item.year,
		videoUrl: `https://archive.org/download/${item.identifier}/${item.identifier}.mp4`
	};
}

/**
 * Get the direct MP4 URL for an IA item.
 * Checks for common video filename variants.
 */
export function getVideoUrl(identifier: string): string {
	return `https://archive.org/download/${identifier}/${identifier}.mp4`;
}

/**
 * Check if a video exists (range request to test availability).
 */
export async function checkVideoAvailable(identifier: string): Promise<boolean> {
	const url = getVideoUrl(identifier);
	try {
		const res = await fetch(url, { method: 'HEAD' });
		return res.ok;
	} catch {
		return false;
	}
}
