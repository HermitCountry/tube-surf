<script lang="ts">
	import { channels, activeChannel } from '$lib/stores/settings';

	let currentChannel = $derived($channels[$activeChannel]);
	let videoUrl = $derived(currentChannel?.identifier
		? (currentChannel.identifier.startsWith('http') 
			? currentChannel.identifier  // Already a URL (HLS stream, etc.)
			: `https://archive.org/download/${currentChannel.identifier}/${currentChannel.identifier}.mp4`)
		: null);

	let videoError = $state<string | null>(null);
	let videoReady = $state(false);
	let isMuted = $state(true);
	let videoEl: HTMLVideoElement | undefined = $state(undefined);

	function onVideoError(e: Event) {
		const video = e.target as HTMLVideoElement;
		const code = video.error?.code;
		const msg = video.error?.message;
		videoError = `Error ${code}: ${msg}`;
	}

	function onVideoCanPlay() {
		videoReady = true;
		videoError = null;
	}

	function onVideoLoadStart() {
		videoReady = false;
	}

	function onVideoMetaData() {
		const video = videoEl;
		if (!video || !video.duration) return;
		const minSeek = video.duration * 0.1;
		const maxSeek = video.duration * 0.8;
		video.currentTime = minSeek + Math.random() * (maxSeek - minSeek);
	}

	function toggleMute() {
		const video = videoEl;
		if (!video) return;
		video.muted = !video.muted;
		isMuted = video.muted;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'm' || e.key === 'M') toggleMute();
		if (e.key === 'ArrowUp' || e.key === 'ArrowRight') $activeChannel = ($activeChannel + 1) % $channels.length;
		if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') $activeChannel = ($activeChannel - 1 + $channels.length) % $channels.length;
	}

	$effect(() => {
		$activeChannel; videoError = null; videoReady = false;
		// Force play after channel switch for consistent autoplay
		setTimeout(() => { if (videoEl) videoEl.play().catch(() => {}); }, 100);
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="player-area">
	<!-- TV Frame -->
	<div class="tv-container">
		<div class="tv-screen">
			{#if videoUrl && currentChannel?.identifier}
				<video
					bind:this={videoEl}
					class="main-video"
					src={videoUrl}
					autoplay
					muted
					playsinline
					controls
					onerror={onVideoError}
					oncanplay={onVideoCanPlay}
					onloadstart={onVideoLoadStart}
					onloadedmetadata={onVideoMetaData}
				></video>
			{/if}

			<!-- CRT effects overlay -->
			<div class="crt-scanlines"></div>
			<div class="crt-flicker"></div>
			<div class="crt-vignette"></div>
		</div>

		<!-- Channel number display -->
		<div class="channel-number">
			{$activeChannel + 1}
		</div>
	</div>

	<!-- Sound toggle -->
	<button class="sound-btn" onclick={toggleMute} title={isMuted ? 'Unmute (m)' : 'Mute (m)'}>
		{isMuted ? '🔇' : '🔊'}
	</button>

	{#if currentChannel}
		<div class="channel-overlay">
			<h2 class="channel-name">{currentChannel.name}</h2>
			<p class="channel-desc">{currentChannel.description}</p>
		</div>
	{/if}
</div>

<style>
	.player-area {
		position: fixed;
		top: 0;
		left: 340px;
		right: 0;
		bottom: 0;
		background: #0a0a0a;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* ── TV Frame ── */
	.tv-container {
		position: relative;
		width: 70%;
		max-width: 900px;
		aspect-ratio: 4 / 3;
		background: #1a1a1a;
		border-radius: 16px;
		padding: 4px;
		box-shadow:
			0 0 0 3px #333,
			0 0 0 8px #1a1a1a,
			0 0 40px rgba(0, 0, 0, 0.5),
			inset 0 0 40px rgba(0, 0, 0, 0.3);
	}

	/* ── TV Screen ── */
	.tv-screen {
		position: relative;
		width: 100%;
		height: 100%;
		background: #000;
		border-radius: 12px;
		overflow: hidden;
	}

	.main-video {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	/* Hide native controls */
	.main-video::-webkit-media-controls,
	.main-video::-webkit-media-controls-enclosure {
		display: none !important;
	}

	/* ── CRT Scanlines ── */
	.crt-scanlines {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: repeating-linear-gradient(
			0deg,
			transparent,
			transparent 2px,
			rgba(0, 0, 0, 0.08) 2px,
			rgba(0, 0, 0, 0.08) 4px
		);
		z-index: 5;
	}

	/* ── Subtle flicker ── */
	.crt-flicker {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 6;
		animation: flicker 0.15s infinite;
		opacity: 0;
	}

	@keyframes flicker {
		0% { opacity: 0.02; }
		50% { opacity: 0; }
		51% { opacity: 0.03; }
		100% { opacity: 0; }
	}

	/* ── Vignette ── */
	.crt-vignette {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 4;
		background: radial-gradient(
			ellipse at center,
			transparent 60%,
			rgba(0, 0, 0, 0.4) 100%
		);
	}

	/* ── Channel Number ── */
	.channel-number {
		position: absolute;
		top: -28px;
		right: 8px;
		font-size: 14px;
		font-family: 'Courier New', monospace;
		color: #4f4;
		background: rgba(0, 0, 0, 0.7);
		padding: 2px 8px;
		border-radius: 3px;
		text-shadow: 0 0 4px rgba(68, 255, 68, 0.5);
	}

	/* ── Sound Button ── */
	.sound-btn {
		position: fixed;
		top: 20px;
		left: 360px;
		z-index: 100;
		background: rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: #fff;
		padding: 8px 12px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 16px;
	}

	.sound-btn:hover { background: rgba(255, 255, 255, 0.1); }

	/* ── Channel Info ── */
	.channel-overlay {
		position: absolute;
		bottom: 20px;
		left: 20px;
		right: 20px;
		padding: 12px 16px;
		background: linear-gradient(transparent, rgba(0,0,0,0.8));
		pointer-events: none;
		border-radius: 0 0 12px 12px;
	}

	.channel-name {
		font-size: 16px;
		font-weight: 600;
		margin: 0 0 2px 0;
	}

	.channel-desc {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.6);
		margin: 0;
		max-width: 500px;
	}
</style>
