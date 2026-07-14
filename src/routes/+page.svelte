<script lang="ts">
	import { mode, channels, activeChannel, type Channel } from '$lib/stores/settings';
	import ChannelPlayer from '$lib/components/ChannelPlayer.svelte';
	import ChannelGuide from '$lib/components/ChannelGuide.svelte';
	import ModeToggle from '$lib/components/ModeToggle.svelte';
	import { NEWS_CHANNELS } from '$lib/ia/channels';
	import { computeTimeNormalizedSearches, buildSearchUrl, buildHourSearchUrl, buildYesterdaySearchUrl, fetchSearchResult } from '$lib/ia/time';
	import { onMount } from 'svelte';

	let loading = $state(true);
	let statusMsg = $state('Tuning in...');

	onMount(async () => {
		await loadNewsChannels();
	});

	async function loadNewsChannels() {
		loading = true;
		statusMsg = 'Scanning the airwaves...';

		const now = new Date();
		const searches = computeTimeNormalizedSearches(now);

		const results: Channel[] = [];

		for (const s of searches) {
			statusMsg = `Tuning ${s.channel.flag} ${s.channel.name}...`;

			// Try exact time match
			const url = buildSearchUrl(s.channel.id, s.searchDate, s.searchTime);
			let item = await fetchSearchResult(url);

			// Fallback: same hour, any minute
			if (!item) {
				const hourUrl = buildHourSearchUrl(s.channel.id, s.searchDate, s.searchTime);
				item = await fetchSearchResult(hourUrl);
			}

			// Fallback: yesterday
			if (!item) {
				const yesterdayUrl = buildYesterdaySearchUrl(s.channel.id, s.searchTime);
				item = await fetchSearchResult(yesterdayUrl);
			}

			if (item) {
				results.push({
					id: s.channel.id,
					name: `${s.channel.flag} ${s.channel.name}`,
					collection: 'tvarchive',
					identifier: item.identifier,
					description: item.title || s.channel.description,
					favorited: false,
					hidden: false,
				});
			} else {
				// Channel with no content found — still add it as a placeholder
				results.push({
					id: s.channel.id,
					name: `${s.channel.flag} ${s.channel.name}`,
					collection: 'tvarchive',
					description: s.channel.description,
					favorited: false,
					hidden: false,
				});
			}
		}

		channels.set(results);
		activeChannel.set(0);
		loading = false;
		statusMsg = '';
	}

	function rescan() {
		loadNewsChannels();
	}
</script>

<div class="app-container" data-mode={$mode}>
	<ModeToggle />

	{#if loading}
		<div class="loading-screen">
			<div class="scanline"></div>
			<div class="loading-content">
				<h1 class="loading-title">tube-surf</h1>
				<p class="loading-subtitle">Channel surf the world. Past and present.</p>
				<p class="loading-status">{statusMsg}</p>
				<div class="loading-bar">
					<div class="loading-fill"></div>
				</div>
			</div>
		</div>
	{:else}
		<div class="main-ui">
			<ChannelGuide />
			<ChannelPlayer />
			<button class="rescan-btn" onclick={rescan}>📡 Rescan</button>
		</div>
	{/if}
</div>

<style>
	.app-container {
		width: 100vw;
		height: 100vh;
		background: #000;
		color: #fff;
		font-family: system-ui, sans-serif;
		overflow: hidden;
	}

	/* Loading Screen */
	.loading-screen {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #000;
		z-index: 200;
	}

	.scanline {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			0deg,
			transparent,
			transparent 2px,
			rgba(255, 255, 255, 0.03) 2px,
			rgba(255, 255, 255, 0.03) 4px
		);
		pointer-events: none;
		animation: scan 8s linear infinite;
	}

	@keyframes scan {
		from { transform: translateY(-100%); }
		to { transform: translateY(100%); }
	}

	.loading-content {
		text-align: center;
		z-index: 1;
	}

	.loading-title {
		font-size: 48px;
		font-weight: 700;
		margin: 0 0 8px 0;
		letter-spacing: -1px;
	}

	.loading-subtitle {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.5);
		margin: 0 0 32px 0;
	}

	.loading-status {
		font-size: 13px;
		color: rgba(255, 255, 255, 0.6);
		margin: 0 0 16px 0;
		font-family: 'Courier New', monospace;
	}

	.loading-bar {
		width: 200px;
		height: 2px;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 2px;
		margin: 0 auto;
		overflow: hidden;
	}

	.loading-fill {
		width: 30%;
		height: 100%;
		background: #fff;
		border-radius: 2px;
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { width: 20%; transform: translateX(-100%); }
		50% { width: 60%; }
		100% { transform: translateX(400%); }
	}

	/* Main UI */
	.main-ui {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.rescan-btn {
		position: fixed;
		bottom: 12px;
		right: 12px;
		z-index: 100;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: #fff;
		padding: 8px 16px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 13px;
	}

	.rescan-btn:hover {
		background: rgba(255, 255, 255, 0.2);
	}
</style>
