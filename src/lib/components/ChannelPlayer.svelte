<script lang="ts">
	import { channels, activeChannel } from '$lib/stores/settings';

	let currentChannel = $derived($channels[$activeChannel]);
	let videoUrl = $derived(currentChannel?.identifier
		? `https://archive.org/download/${currentChannel.identifier}/${currentChannel.identifier}.mp4`
		: null);

	let videoError = $state<string | null>(null);
	let videoReady = $state(false);
	let networkState = $state('initial');
	let isMuted = $state(true);
	let volume = $state(1);

	function onVideoError(e: Event) {
		const video = e.target as HTMLVideoElement;
		const code = video.error?.code;
		const msg = video.error?.message;
		videoError = `Error ${code}: ${msg}`;
	}

	function onVideoCanPlay() {
		videoReady = true;
		videoError = null;
		networkState = 'canplay';
	}

	function onVideoLoadStart() {
		networkState = 'loadstart';
	}

	function toggleMute(e: Event) {
		const video = e.currentTarget as HTMLVideoElement;
		video.muted = !video.muted;
		isMuted = video.muted;
	}

	function handleVolume(e: Event) {
		const video = e.currentTarget as HTMLVideoElement;
		volume = video.volume;
		isMuted = video.muted;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'm' || e.key === 'M') {
			const video = document.querySelector('video');
			if (video) {
				video.muted = !video.muted;
				isMuted = video.muted;
			}
		}
		// Channel up/down with arrow keys
		if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
			const next = ($activeChannel + 1) % $channels.length;
			$activeChannel = next;
		}
		if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
			const prev = ($activeChannel - 1 + $channels.length) % $channels.length;
			$activeChannel = prev;
		}
	}

	$effect(() => {
		$activeChannel;
		videoError = null;
		videoReady = false;
		networkState = 'changed';
	});
</script>

<svelte:window onkeydown={handleKeydown} />

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
			onvolumechange={handleVolume}
		></video>
	{/if}

	<!-- Sound toggle button -->
	<button class="sound-btn" onclick={() => {
		const video = document.querySelector('video');
		if (video) { video.muted = !video.muted; isMuted = video.muted; }
	}} title={isMuted ? 'Unmute (m)' : 'Mute (m)'}>
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

	.sound-btn {
		position: fixed;
		bottom: 12px;
		left: 340px;
		z-index: 100;
		background: rgba(0, 0, 0, 0.6);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: #fff;
		padding: 8px 12px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 18px;
		line-height: 1;
	}

	.sound-btn:hover {
		background: rgba(255, 255, 255, 0.15);
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
