<script lang="ts">
	import { channels, activeChannel } from '$lib/stores/settings';

	let currentChannel = $derived($channels[$activeChannel]);
	let videoUrl = $derived(currentChannel?.identifier
		? `https://archive.org/download/${currentChannel.identifier}/${currentChannel.identifier}.mp4`
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
		></video>
	{/if}

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
