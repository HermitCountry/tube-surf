/**
 * Channel definitions for tube-surf.
 *
 * Each channel is a real TV station from the Internet Archive's tvarchive collection.
 * The timezone offset is used to normalize broadcasts to the viewer's local time.
 * Example: FRANCE24 at 7pm Paris = 17:00 UTC = shown at viewer's 7pm local.
 */

export type ChannelDef = {
	id: string;             // IA identifier prefix (e.g., "FRANCE24")
	name: string;           // Display name
	flag: string;           // Emoji flag
	location: string;       // City/Country
	timezoneOffset: number; // UTC offset in hours (e.g., 2 for CEST, -7 for PDT)
	description: string;
};

export const NEWS_CHANNELS: ChannelDef[] = [
	{
		id: 'SFGTV',
		name: 'SFGTV',
		flag: '🇺🇸',
		location: 'San Francisco, USA',
		timezoneOffset: -7,
		description: 'San Francisco government TV — board meetings, press conferences, local civic life',
	},
	{
		id: 'TELESUR',
		name: 'TeleSUR',
		flag: '🇻🇪',
		location: 'Caracas, Venezuela',
		timezoneOffset: -4,
		description: 'Latin American news network — news, analysis, documentaries from the Global South',
	},
	{
		id: 'GBN',
		name: 'GB News',
		flag: '🇬🇧',
		location: 'London, UK',
		timezoneOffset: 1,
		description: 'British news and current affairs — GB News programming',
	},
	{
		id: 'FRANCE24',
		name: 'France 24',
		flag: '🇫🇷',
		location: 'Paris, France',
		timezoneOffset: 2,
		description: 'French international news network — 24/7 coverage in French',
	},
	{
		id: 'RT',
		name: 'RT',
		flag: '🇷🇺',
		location: 'Moscow, Russia',
		timezoneOffset: 3,
		description: 'Russia Today — news, documentaries, talk shows',
	},
	{
		id: 'PALESTINETV',
		name: 'Palestine TV',
		flag: '🇵🇸',
		location: 'Ramallah, Palestine',
		timezoneOffset: 3,
		description: 'Palestinian public broadcaster — news, cultural programming',
	},
	{
		id: 'KAN11',
		name: 'Kan 11',
		flag: '🇮🇱',
		location: 'Tel Aviv, Israel',
		timezoneOffset: 3,
		description: 'Israeli public broadcaster — news, current affairs',
	},
	{
		id: 'PRESSTV',
		name: 'Press TV',
		flag: '🇮🇷',
		location: 'Tehran, Iran',
		timezoneOffset: 3.5,
		description: 'Iranian international news network — English and Persian programming',
	},
	{
		id: 'TVRI',
		name: 'TVRI',
		flag: '🇮🇩',
		location: 'Jakarta, Indonesia',
		timezoneOffset: 7,
		description: 'Indonesian public broadcaster — news, culture, education',
	},
	{
		id: 'KCTV',
		name: 'KCTV',
		flag: '🇰🇵',
		location: 'Pyongyang, North Korea',
		timezoneOffset: 9,
		description: 'Korean Central Television — North Korean state broadcasting',
	},
];
