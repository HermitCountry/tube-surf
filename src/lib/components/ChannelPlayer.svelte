<script lang="ts">
	import { channels, activeChannel, mode } from '$lib/stores/settings';
	import { getVideoUrl } from '$lib/ia/api';

	/** Pre-load the next and previous channels in hidden video elements */
	let loadedVideos = $state<Record<string, string>>({});

	$effect(() => {
		const idx = $activeChannel;
		const ch = $channels;
		const ids: string[] = [];

		// Current + prev + next
		if (ch[idx]) ids.push(ch[idx].identifier ?? ch[idx].id);
		if (ch[idx - 1]) ids.push(ch[idx - 1].identifier ?? ch[idx - 1].id);
		if (ch[idx + 1]) ids.push(ch[idx + 1].identifier ?? ch[idx + 1].id);

		for (const id of ids) {
			if (!loadedVideos[id]) {
				loadedVideos[id] = getVideoUrl(id);
			}
		}
	});

	let currentChannel = $derived($channels[$activeChannel]);
	let videoUrl = $derived(currentChannel?.identifier
		? getVideoUrl(currentChannel.identifier)
		: null);
</script>

<div class="player-area">
	{#if videoUrl}
		<video
			class="main-video"
			src={videoUrl}
			autoplay
			muted
			playsinline
			controls={false}
		></video>
	{/if}

	<!-- Channel info overlay -->
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
