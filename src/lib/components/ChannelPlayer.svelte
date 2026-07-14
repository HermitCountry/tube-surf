<script lang="ts">
	import { channels, activeChannel } from '$lib/stores/settings';
	import { getVideoUrl } from '$lib/ia/api';

	let currentChannel = $derived($channels[$activeChannel]);
	let videoUrl = $derived(currentChannel?.identifier
		? getVideoUrl(currentChannel.identifier) + '?exact=1'
		: null);

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

	$effect(() => {
		$activeChannel;
		videoError = null;
		videoReady = false;
		networkState = 'changed';
	});
</script>

<div class="player-area">
	{#if videoUrl && currentChannel?.identifier}
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
	{:else if currentChannel && !currentChannel.identifier}
		<div class="no-signal">
			<p class="no-signal-text">📡 No Signal</p>
			<p class="no-signal-sub">No broadcast found</p>
		</div>
	{/if}

	<div class="debug-info">
		<p>Channel: {currentChannel?.name ?? 'none'}</p>
		<p>Identifier: {currentChannel?.identifier ?? 'none'}</p>
		<p>URL: {videoUrl ?? 'none'}</p>
		<p>State: {networkState}</p>
		{#if videoError}<p class="error">⚠️ {videoError}</p>{/if}
		{#if videoReady}<p style="color:#4caf50">✅ Playing</p>{/if}
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

	.no-signal {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
	}

	.no-signal-text {
		font-size: 24px;
		color: rgba(255, 255, 255, 0.6);
		margin: 0 0 8px 0;
	}

	.no-signal-sub {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.3);
		margin: 0;
	}

	.debug-info {
		position: absolute;
		top: 50px;
		left: 340px;
		right: 20px;
		background: rgba(0,0,0,0.85);
		padding: 12px;
		font-family: monospace;
		font-size: 12px;
		z-index: 20;
		border: 1px solid rgba(255,255,255,0.1);
		border-radius: 6px;
		line-height: 1.4;
	}

	.debug-info p { margin: 2px 0; word-break: break-all; }
	.debug-info .error { color: #ff6b6b; font-weight: bold; }

	.channel-overlay {
		position: absolute;
		bottom: 40px;
		left: 340px;
		right: 20px;
		background: linear-gradient(transparent, rgba(0,0,0,0.7));
		padding: 20px;
		pointer-events: none;
	}

	.channel-name { font-size: 18px; font-weight: 600; margin: 0 0 4px 0; }
	.channel-desc { font-size: 13px; color: rgba(255, 255, 255, 0.7); margin: 0; max-width: 600px; }
</style>
