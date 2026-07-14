/**
 * UbuWeb film data loader for tube-surf.
 * Loads the scraped film catalog for decade-based channels.
 */
import ubuData from './ubuweb_films.json';

type UbuFilm = {
	title: string;
	filmmaker: string;
	year: number | null;
	mp4_url: string;
	hls_url: string | null;
};

type DecadeChannel = {
	decade: string;
	label: string;
	films: UbuFilm[];
};

/**
 * Get all decade channels with their films.
 * Each channel represents a decade of avant-garde film.
 */
export function getDecadeChannels(): DecadeChannel[] {
	const decades = ubuData.decades as Record<string, UbuFilm[]>;

	const labels: Record<string, string> = {
		'pre-1940s': 'Pre-1940s — Early Experimental Film',
		'1940s': 'The 1940s — Surrealism & War',
		'1950s': 'The 1950s — Beat Generation',
		'1960s': 'The 1960s — Underground Explosion',
		'1970s': 'The 1970s — Video Art Revolution',
		'1980s': 'The 1980s — Punk & Postmodern',
		'1990s': 'The 1990s — Digital Frontiers',
		'2000s': 'The 2000s — New Media Art',
		'2010s+': 'The 2010s+ — Contemporary Avant-Garde',
		'unknown': 'Unknown Era — Lost & Found',
	};

	return Object.entries(decades)
		.filter(([_, films]) => films.length > 0)
		.map(([decade, films]) => ({
			decade,
			label: labels[decade] || decade,
			films,
		}));
}

/**
 * Get a random film from a given decade channel.
 */
export function getRandomFilm(channel: DecadeChannel): UbuFilm {
	const idx = Math.floor(Math.random() * channel.films.length);
	return channel.films[idx];
}

/**
 * Get the video URL for a film.
 * Prefers HLS for Safari, falls back to proxied MP4.
 */
export function getFilmVideoUrl(film: UbuFilm): string {
	if (film.hls_url) return film.hls_url;
	// Fallback: proxy MP4 through our server
	return `/api/video?url=${encodeURIComponent(film.mp4_url)}`;
}
