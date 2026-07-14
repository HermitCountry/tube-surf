<script lang="ts">
	import { channels, activeChannel } from '$lib/stores/settings';

	let currentChannel = $derived($channels[$activeChannel]);
	let embedUrl = $derived(currentChannel?.identifier
		? `https://archive.org/embed/${currentChannel.identifier}?autoplay=1`
		: null);

	let videoError = $state<string | null>(null);
	let iframeLoaded = $state(false);

	function onIframeLoad() {
		iframeLoaded = true;
		videoError = null;
	}

	$effect(() => {
		$activeChannel;
		iframeLoaded = false;
		videoError = null;
	});
</script>

<div class="player-area">
	{#if embedUrl && currentChannel?.identifier}
		<iframe
			class="embed-player"
			src={embedUrl}
			allow="autoplay; fullscreen"
			allowfullscreen
			onload={onIframeLoad}
		></iframe>
	{:else if currentChannel && !currentChannel.identifier}
		<div class="no-signal">
			<p class="no-signal-text">📡 No Signal</p>
			<p class="no-signal-sub">No broadcast found</p>
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

	.embed-player {
		width: 100%;
		height: 100%;
		border: none;
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
