<script lang="ts">
	import { mode, channels, activeChannel, type Channel } from '$lib/stores/settings';
	import ChannelPlayer from '$lib/components/ChannelPlayer.svelte';
	import ChannelGuide from '$lib/components/ChannelGuide.svelte';
	import ModeToggle from '$lib/components/ModeToggle.svelte';
	import { NEWS_CHANNELS } from '$lib/ia/channels';

	// Hardcoded known-working identifiers — all verified with MP4 files
	const KNOWN_WORKING: { id: string; identifier: string; title: string }[] = [
		{ id: 'FRANCE24', identifier: 'FRANCE24_20260713_170000', title: 'France 24 — 7:00pm-7:31pm CEST' },
		{ id: 'RT', identifier: 'RT_20260713_160000_News', title: 'RT — 12:00pm-12:31pm EDT' },
		{ id: 'KCTV', identifier: 'KCTV_20260713_100000', title: 'KCTV — 7:00pm-7:31pm KST' },
		{ id: 'GBN', identifier: 'GBN_20260713_180000_GBN_Tonight', title: 'GB News — GBN Tonight, 7:00pm-8:01pm BST' },
		{ id: 'PALESTINETV', identifier: 'PALESTINETV_20260713_010000', title: 'Palestine TV — broadcast' },
		{ id: 'PRESSTV', identifier: 'PRESSTV_20260713_230000', title: 'Press TV — broadcast' },
	];

	let started = $state(false);
	let loading = $state(false);

	function tuneIn() {
		started = true;
		loading = true;

		const results: Channel[] = KNOWN_WORKING.map((kw) => {
			const ch = NEWS_CHANNELS.find((c) => c.id === kw.id);
			return {
				id: kw.id,
				name: `${ch?.flag ?? '📺'} ${ch?.name ?? kw.id}`,
				collection: 'tvarchive',
				identifier: kw.identifier,
				description: kw.title,
				favorited: false,
				hidden: false,
			};
		});

		channels.set(results);
		activeChannel.set(0);
		loading = false;
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
			<p style="color: rgba(255,255,255,0.5);">Loading channels...</p>
		</div>
	{:else}
		<ModeToggle />
		<div class="main-ui">
			<ChannelGuide />
			<ChannelPlayer />
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
			0deg, transparent, transparent 2px,
			rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px
		);
		pointer-events: none;
		animation: scan 8s linear infinite;
	}

	@keyframes scan {
		from { transform: translateY(-100%); }
		to { transform: translateY(100%); }
	}

	.welcome-content {
		text-align: center;
		z-index: 1;
	}

	.welcome-title {
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

	.main-ui {
		width: 100%;
		height: 100%;
		position: relative;
	}
</style>
