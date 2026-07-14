<script lang="ts">
	import { mode, channels, activeChannel, type Channel } from '$lib/stores/settings';
	import ChannelPlayer from '$lib/components/ChannelPlayer.svelte';
	import ChannelGuide from '$lib/components/ChannelGuide.svelte';
	import ModeToggle from '$lib/components/ModeToggle.svelte';
	import { NEWS_CHANNELS } from '$lib/ia/channels';
	import { computeTimeNormalizedSearches } from '$lib/ia/time';

	let loading = $state(false);
	let statusMsg = $state('');
	let started = $state(false);

	async function tuneIn() {
		started = true;
		loading = true;
		statusMsg = 'Scanning the airwaves...';

		const now = new Date();
		const searches = computeTimeNormalizedSearches(now);

		const results: Channel[] = [];

		for (const s of searches) {
			statusMsg = `Tuning ${s.channel.flag} ${s.channel.name}...`;

			// Search via our proxy (avoids CORS)
			const query = `collection:tvarchive AND identifier:${s.channel.id}_${s.searchDate}_${s.searchTime}*`;
			const url = `/api/search?q=${encodeURIComponent(query)}&rows=3`;

			let item: { identifier: string; title: string } | null = null;

			try {
				const res = await fetch(url);
				const data = await res.json();
				const docs = data?.response?.docs;
				if (docs && docs.length > 0) {
					item = { identifier: docs[0].identifier, title: docs[0].title };
				}
			} catch {}

			// Fallback: same hour, any minute
			if (!item) {
				const hour = s.searchTime.slice(0, 2);
				const fallbackQuery = `collection:tvarchive AND identifier:${s.channel.id}_${s.searchDate}_${hour}*`;
				try {
					const fallbackRes = await fetch(`/api/search?q=${encodeURIComponent(fallbackQuery)}&rows=3`);
					const fallbackData = await fallbackRes.json();
					const fallbackDocs = fallbackData?.response?.docs;
					if (fallbackDocs && fallbackDocs.length > 0) {
						item = { identifier: fallbackDocs[0].identifier, title: fallbackDocs[0].title };
					}
				} catch {}
			}

			// Fallback: yesterday
			if (!item) {
				const yesterday = new Date();
				yesterday.setDate(yesterday.getDate() - 1);
				const y = yesterday.getUTCFullYear();
				const m = String(yesterday.getUTCMonth() + 1).padStart(2, '0');
				const d = String(yesterday.getUTCDate()).padStart(2, '0');
				const hour = s.searchTime.slice(0, 2);
				const yQuery = `collection:tvarchive AND identifier:${s.channel.id}_${y}${m}${d}_${hour}*`;
				try {
					const yRes = await fetch(`/api/search?q=${encodeURIComponent(yQuery)}&rows=3`);
					const yData = await yRes.json();
					const yDocs = yData?.response?.docs;
					if (yDocs && yDocs.length > 0) {
						item = { identifier: yDocs[0].identifier, title: yDocs[0].title };
					}
				} catch {}
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
		tuneIn();
	}
</script>

<div class="app-container" data-mode={$mode}>
	{#if !started}
		<div class="welcome-screen">
			<div class="scanline"></div>
			<div class="welcome-content">
				<h1 class="welcome-title">tube-surf</h1>
				<p class="welcome-subtitle">Channel surf the world. Past and present. No algorithms.</p>
				<button class="tune-btn" onclick={tuneIn}>
					📡 Tune In
				</button>
			</div>
		</div>
	{:else if loading}
		<div class="loading-screen">
			<div class="scanline"></div>
			<div class="loading-content">
				<h1 class="loading-title">tube-surf</h1>
				<p class="loading-status">{statusMsg}</p>
				<div class="loading-bar">
					<div class="loading-fill"></div>
				</div>
			</div>
		</div>
	{:else}
		<ModeToggle />
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

	/* Welcome Screen */
	.welcome-screen, .loading-screen {
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

	.welcome-content, .loading-content {
		text-align: center;
		z-index: 1;
	}

	.welcome-title, .loading-title {
		font-size: 48px;
		font-weight: 700;
		margin: 0 0 8px 0;
		letter-spacing: -1px;
	}

	.welcome-subtitle {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.5);
		margin: 0 0 32px 0;
	}

	.tune-btn {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.3);
		color: #fff;
		padding: 14px 40px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 18px;
		transition: all 0.15s;
	}

	.tune-btn:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.5);
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
