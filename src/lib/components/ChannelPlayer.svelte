<script lang="ts">
	import { channels, activeChannel, mode } from '$lib/stores/settings';
	import { getVideoUrl } from '$lib/ia/api';

	let currentChannel = $derived($channels[$activeChannel]);
	let videoUrl = $derived(currentChannel?.identifier
		? getVideoUrl(currentChannel.identifier)
		: null);

	let videoError = $state<string | null>(null);
	let videoReady = $state(false);
	let networkState = $state<string>('initial');

	function onVideoError(e: Event) {
		const video = e.target as HTMLVideoElement;
		const code = video.error?.code;
		const msg = video.error?.message;
		const medErr = video.error?.MEDIA_ERR_NETWORK ?? video.error?.MEDIA_ERR_DECODE;
		videoError = `Error ${code}: ${msg} (network: ${video.networkState}, ready: ${video.readyState})`;
		networkState = `network=${video.networkState} ready=${video.readyState}`;
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

	// Reset when channel changes
	$effect(() => {
		$activeChannel;
		videoError = null;
		videoReady = false;
		networkState = 'changed';
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
			onloadstart={onVideoLoadStart}
			onwaiting={onVideoWaiting}
		></video>
	{/if}

	<!-- Debug info -->
	<div class="debug-info">
		<p>Channel: {currentChannel?.name ?? 'none'}</p>
		<p>Identifier: {currentChannel?.identifier ?? 'none'}</p>
		<p>Video URL: {videoUrl ?? 'none'}</p>
		<p>State: {networkState}</p>
		{#if videoError}
			<p class="error">⚠️ {videoError}</p>
		{/if}
	</div>

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

	.debug-info {
		position: absolute;
		top: 50px;
		left: 340px;
		right: 20px;
		background: rgba(0,0,0,0.85);
		padding: 16px;
		font-family: monospace;
		font-size: 12px;
		z-index: 20;
		border: 1px solid rgba(255,255,255,0.1);
		border-radius: 8px;
		line-height: 1.5;
	}

	.debug-info p {
		margin: 2px 0;
		word-break: break-all;
	}

	.debug-info .error {
		color: #ff6b6b;
		font-weight: bold;
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
