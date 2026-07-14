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

	console.log('[tube-surf proxy] Query:', query);
	console.log('[tube-surf proxy] IA URL:', iaUrl);

	const response = await fetch(iaUrl, {
		headers: {
			'User-Agent': 'tube-surf/0.1.0 (SvelteKit; +https://github.com/HermitCountry/tube-surf)'
		}
	});

	console.log('[tube-surf proxy] IA response status:', response.status);

	if (!response.ok) {
		const text = await response.text();
		console.log('[tube-surf proxy] IA error body:', text.slice(0, 500));
		return new Response(JSON.stringify({ error: `IA API returned ${response.status}` }), {
			status: response.status,
			headers: { 'content-type': 'application/json' }
		});
	}

	const data = await response.json();
	const numFound = data?.response?.numFound ?? 0;
	console.log(`[tube-surf proxy] Found ${numFound} items`);

	return new Response(JSON.stringify(data), {
		status: 200,
		headers: {
			'content-type': 'application/json',
			'cache-control': 'public, max-age=300'
		}
	});
};
