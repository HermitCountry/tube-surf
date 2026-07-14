<script lang="ts">
	// HARDCODED TEST — FRANCE24 July 13 7pm Paris news
	const TEST_IDENTIFIER = 'FRANCE24_20260713_170000';
	const TEST_DIRECT_URL = `https://archive.org/download/${TEST_IDENTIFIER}/${TEST_IDENTIFIER}.mp4?exact=1`;
	const TEST_EMBED_URL = `https://archive.org/embed/${TEST_IDENTIFIER}`;

	let useDirect = $state(true);
	let useEmbed = $state(false);
	let videoError = $state<string | null>(null);
	let videoReady = $state(false);
	let networkState = $state('initial');
	let currentUrl = $state(TEST_DIRECT_URL);

	function onVideoError(e: Event) {
		const video = e.target as HTMLVideoElement;
		const code = video.error?.code;
		const msg = video.error?.message;
		videoError = `Error ${code}: ${msg}`;
		networkState = `error: net=${video.networkState} ready=${video.readyState}`;

		// Fallback to embed if direct fails
		if (useDirect) {
			console.log('Direct video failed, trying embed...');
			useDirect = false;
			useEmbed = true;
			currentUrl = TEST_EMBED_URL;
			videoError = null;
		}
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
	{#if useDirect}
		<video
			class="main-video"
			src={currentUrl}
			autoplay
			muted
			playsinline
			controls
			onerror={onVideoError}
			oncanplay={onVideoCanPlay}
			onloadstart={onVideoLoadStart}
			onwaiting={onVideoWaiting}
		></video>
	{:else if useEmbed}
		<iframe
			class="embed-player"
			src={currentUrl}
			allow="autoplay; fullscreen"
			allowfullscreen
		></iframe>
	{/if}

	<div class="debug-info" style:bottom={useEmbed ? '0' : 'auto'} style:top={useEmbed ? 'auto' : '50px'}>
		<p><strong>Test — 7pm Paris news (FRANCE24)</strong></p>
		<p>Mode: {useDirect ? 'direct MP4' : 'IA embed'}</p>
		<p>URL: {currentUrl}</p>
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

	.embed-player {
		width: 100%;
		height: 100%;
		border: none;
	}

	.debug-info {
		position: absolute;
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
