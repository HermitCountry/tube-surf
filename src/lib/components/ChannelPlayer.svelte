<script lang="ts">
	import { channels, activeChannel } from '$lib/stores/settings';

	let currentChannel = $derived($channels[$activeChannel]);
	let videoUrl = $derived(currentChannel?.identifier
		? `https://archive.org/download/${currentChannel.identifier}/${currentChannel.identifier}.mp4`
		: null);

	let videoError = $state<string | null>(null);
	let videoReady = $state(false);
	let isMuted = $state(true);
	let volume = $state(1);
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

	// When video metadata loads, seek to a random position
	function onVideoMetaData() {
		const video = videoEl;
		if (!video || !video.duration) return;

		// Seek to a random position between 10% and 80% into the video
		const minSeek = video.duration * 0.1;
		const maxSeek = video.duration * 0.8;
		const randomTime = minSeek + Math.random() * (maxSeek - minSeek);
		video.currentTime = randomTime;
	}

	function toggleMute() {
		const video = videoEl;
		if (!video) return;
		video.muted = !video.muted;
		isMuted = video.muted;
	}

	function onVolumeChange() {
		const video = videoEl;
		if (!video) return;
		volume = video.volume;
		isMuted = video.muted;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'm' || e.key === 'M') {
			toggleMute();
		}
		if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
			const next = ($activeChannel + 1) % $channels.length;
			$activeChannel = next;
		}
		if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
			const prev = ($activeChannel - 1 + $channels.length) % $channels.length;
			$activeChannel = prev;
		}
	}

	// Reset state on channel switch
	$effect(() => {
		$activeChannel;
		videoError = null;
		videoReady = false;
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="player-area">
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
			onvolumechange={onVolumeChange}
		></video>
	{/if}

	<!-- Sound toggle button -->
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

	/* Hide native controls but keep them in DOM for autoplay support */
	.main-video::-webkit-media-controls {
		display: none !important;
	}
	.main-video::-webkit-media-controls-enclosure {
		display: none !important;
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
