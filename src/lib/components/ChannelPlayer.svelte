<script lang="ts">
	import { channels, activeChannel, mode } from '$lib/stores/settings';

	// HARDCODED TEST — known working video from FRANCE24
	// FRANCE24_20260713_170000 = 7pm Paris news on July 13
	const TEST_IDENTIFIER = 'FRANCE24_20260713_170000';
	const TEST_VIDEO_URL = `https://archive.org/download/${TEST_IDENTIFIER}/${TEST_IDENTIFIER}.mp4`;

	let videoError = $state<string | null>(null);
	let videoReady = $state(false);
	let networkState = $state('initial');

	function onVideoError(e: Event) {
		const video = e.target as HTMLVideoElement;
		const code = video.error?.code;
		const msg = video.error?.message;
		videoError = `Error ${code}: ${msg}`;
		networkState = `error: net=${video.networkState} ready=${video.readyState}`;
	}

	function onVideoCanPlay() {
		videoReady = true;
		videoError = null;
		networkState = 'canplay';
	}

	function onVideoLoadStart() {
		networkState = 'loadstart';
	}

	function onVideoWaiting() {
		networkState = 'waiting';
	}
</script>

<div class="player-area">
	<video
		class="main-video"
		src={TEST_VIDEO_URL}
		autoplay
		muted
		playsinline
		controls
		onerror={onVideoError}
		oncanplay={onVideoCanPlay}
		onloadstart={onVideoLoadStart}
		onwaiting={onVideoWaiting}
	></video>

	<!-- Debug info -->
	<div class="debug-info">
		<p><strong>Test video — 7pm Paris news (FRANCE24)</strong></p>
		<p>URL: {TEST_VIDEO_URL}</p>
		<p>State: {networkState}</p>
		{#if videoReady}
			<p style="color: #4caf50;">✅ Video is playing!</p>
		{/if}
		{#if videoError}
			<p class="error">⚠️ {videoError}</p>
		{/if}
	</div>
</div>

<style>
	.player-area {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: #000;
	}

	.main-video {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.debug-info {
		position: absolute;
		top: 50px;
		left: 40px;
		right: 40px;
		background: rgba(0,0,0,0.85);
		padding: 16px;
		font-family: monospace;
		font-size: 13px;
		z-index: 20;
		border: 1px solid rgba(255,255,255,0.1);
		border-radius: 8px;
		line-height: 1.5;
	}

	.debug-info p {
		margin: 4px 0;
		word-break: break-all;
	}

	.debug-info .error {
		color: #ff6b6b;
		font-weight: bold;
	}
</style>
