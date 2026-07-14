/**
 * Time normalization logic for tube-surf.
 *
 * The tvarchive identifier format is: CHANNEL_YYYYMMDD_HHMMSS_ProgramType
 * The timestamp is in UTC.
 *
 * Time normalization: When the viewer watches at 7pm local time,
 * we find each channel's broadcast that aired at 7pm in THAT CHANNEL'S
 * local time. All channels show content from the same time-of-day,
 * normalized to the viewer's clock.
 *
 * Formula: search_utc_hourmin = user_local_hourmin - channel_timezone_offset
 */

import { NEWS_CHANNELS, type ChannelDef } from './channels';

export type TimeNormalizedSearch = {
	channel: ChannelDef;
	searchDate: string;   // YYYYMMDD
	searchTime: string;   // HHMMSS (UTC)
};

/**
 * Given the user's local date/time, compute the UTC search parameters
 * for each channel such that we find content airing at the same local
 * time-of-day in the channel's timezone.
 */
export function computeTimeNormalizedSearches(
	localDate: Date
): TimeNormalizedSearch[] {
	const userYear = localDate.getFullYear();
	const userMonth = localDate.getMonth();     // 0-indexed
	const userDay = localDate.getDate();
	const userHour = localDate.getHours();
	const userMinute = localDate.getMinutes();

	return NEWS_CHANNELS.map((ch) => {
		// Convert user's time-of-day to the equivalent UTC time for this channel.
		//
		// Example: User at 19:00 Pacific (UTC-7) on July 13, FRANCE24 at UTC+2:
		//   targetHour = 19 - 2 = 17 → 17:00 UTC on July 13
		//   search FRANCE24_20260713_170000*
		//
		// Date.UTC handles hour/minute overflow/underflow correctly
		// (e.g., hour=26 becomes next day at 02:00, hour=-2 becomes previous day)
		let targetHour = userHour - ch.timezoneOffset;
		let targetMinute = userMinute;

		// Handle fractional timezone offsets (e.g., Iran at UTC+3:30)
		const fracOffset = ch.timezoneOffset % 1;
		if (fracOffset !== 0) {
			targetMinute = userMinute - Math.round(fracOffset * 60);
			if (targetMinute < 0) {
				targetMinute += 60;
				targetHour -= 1;
			} else if (targetMinute >= 60) {
				targetMinute -= 60;
				targetHour += 1;
			}
		}

		// Use the user's LOCAL date components. Date.UTC handles rollover
		// (e.g., hour=26 → next day, hour=-2 → previous day).
		const targetDate = new Date(Date.UTC(
			userYear, userMonth, userDay,
			targetHour, targetMinute, 0
		));

		const y = targetDate.getUTCFullYear();
		const m = String(targetDate.getUTCMonth() + 1).padStart(2, '0');
		const d = String(targetDate.getUTCDate()).padStart(2, '0');
		const hh = String(targetDate.getUTCHours()).padStart(2, '0');
		const mm = String(targetDate.getUTCMinutes()).padStart(2, '0');

		return {
			channel: ch,
			searchDate: `${y}${m}${d}`,
			searchTime: `${hh}${mm}00`,
		};
	});
}

/**
 * Build a proxy search URL for finding a broadcast at a given UTC time.
 * Uses our SvelteKit server route to avoid CORS issues.
 */
export function buildSearchUrl(channelId: string, date: string, time: string): string {
	const query = `collection:tvarchive AND identifier:${channelId}_${date}_${time}*`;
	return `/api/search?q=${encodeURIComponent(query)}&rows=5`;
}

/**
 * Fallback search — if exact time match fails, try the same hour with any minutes.
 */
export function buildHourSearchUrl(channelId: string, date: string, time: string): string {
	const hour = time.slice(0, 2);
	const query = `collection:tvarchive AND identifier:${channelId}_${date}_${hour}*`;
	return `/api/search?q=${encodeURIComponent(query)}&rows=5`;
}

/**
 * Build a search for yesterday's date (fallback if today has no content).
 */
export function buildYesterdaySearchUrl(channelId: string, time: string): string {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	const y = yesterday.getUTCFullYear();
	const m = String(yesterday.getUTCMonth() + 1).padStart(2, '0');
	const d = String(yesterday.getUTCDate()).padStart(2, '0');
	const hour = time.slice(0, 2);
	const query = `collection:tvarchive AND identifier:${channelId}_${y}${m}${d}_${hour}*`;
	return `/api/search?q=${encodeURIComponent(query)}&rows=5`;
}

/**
 * Fetch and parse an IA search result.
 */
export async function fetchSearchResult(url: string): Promise<{
	identifier: string;
	title: string;
	description?: string;
} | null> {
	try {
		const res = await fetch(url);
		const data = await res.json();
		const docs = data?.response?.docs;
		if (!docs || docs.length === 0) return null;
		// Return the most recent exact match, or first result
		const doc = docs[0];
		return {
			identifier: doc.identifier,
			title: doc.title,
			description: doc.description,
		};
	} catch {
		return null;
	}
}
