<script lang="ts">
	import { channels, activeChannel, mode } from '$lib/stores/settings';
	import { getVideoUrl } from '$lib/ia/api';

	let currentChannel = $derived($channels[$activeChannel]);
	let videoUrl = $derived(currentChannel?.identifier
		? getVideoUrl(currentChannel.identifier)
		: null);

	let videoError = $state<string | null>(null);
	let videoReady = $state(false);

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

	// Reset error state when switching channels
	$effect(() => {
		$activeChannel;
		videoError = null;
		videoReady = false;
	});
</script>

<div class="player-area">
	{#if videoUrl}
		<video
			class="main-video"
			src={videoUrl}
			autoplay
			muted
			playsinline
			controls
			onerror={onVideoError}
			oncanplay={onVideoCanPlay}
		></video>
	{/if}

	{#if videoError}
		<div class="video-error">
			<p>⚠️ Video error: {videoError}</p>
			<p class="video-url-debug">URL: {videoUrl}</p>
		</div>
	{/if}

	{#if !videoReady && !videoError}
		<div class="video-loading">
			<p>Loading video...</p>
		</div>
	{/if}

	{#if currentChannel}
		<div class="channel-overlay">
			<h2 class="channel-name">{currentChannel.name}</h2>
			{#if currentChannel.description}
				<p class="channel-desc">{currentChannel.description}</p>
			{/if}
		</div>
	{/if}
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

	.video-error {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: #ff6b6b;
		text-align: center;
		font-size: 14px;
		z-index: 10;
	}

	.video-url-debug {
		font-family: monospace;
		font-size: 11px;
		color: rgba(255, 255, 255, 0.5);
		word-break: break-all;
		max-width: 500px;
		margin-top: 8px;
	}

	.video-loading {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: rgba(255, 255, 255, 0.5);
		font-size: 14px;
		z-index: 10;
	}

	.channel-overlay {
		position: absolute;
		bottom: 40px;
		left: 340px;
		right: 20px;
		background: linear-gradient(transparent, rgba(0,0,0,0.7));
		padding: 20px;
		pointer-events: none;
	}

	.channel-name {
		font-size: 18px;
		font-weight: 600;
		margin: 0 0 4px 0;
	}

	.channel-desc {
		font-size: 13px;
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
		max-width: 600px;
	}
</style>
