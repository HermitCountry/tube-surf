/**
 * Server-side proxy for Internet Archive API calls.
 * Avoids CORS issues by making requests from the server.
 *
 * Follows IA's best practices for automated access:
 * https://archive.org/developers/bots.html
 */

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q');
	if (!query) {
		return new Response(JSON.stringify({ error: 'Missing query parameter' }), {
			status: 400,
			headers: { 'content-type': 'application/json' }
		});
	}

	const fields = url.searchParams.get('fl') || 'identifier,title,description';
	const rows = url.searchParams.get('rows') || '5';

	const iaUrl = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(query)}&fl[]=${encodeURIComponent(fields)}&rows=${rows}&sort[]=&output=json`;

	const response = await fetch(iaUrl, {
		headers: {
			'User-Agent': 'tube-surf/0.1.0 (SvelteKit; +https://github.com/HermitCountry/tube-surf)'
		}
	});

	if (!response.ok) {
		return new Response(JSON.stringify({ error: `IA API returned ${response.status}` }), {
			status: response.status,
			headers: { 'content-type': 'application/json' }
		});
	}

	const data = await response.json();

	return new Response(JSON.stringify(data), {
		status: 200,
		headers: {
			'content-type': 'application/json',
			'cache-control': 'public, max-age=300'
		}
	});
};
