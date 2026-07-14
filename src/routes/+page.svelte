<script lang="ts">
	import { mode } from '$lib/stores/settings';
	import ChannelPlayer from '$lib/components/ChannelPlayer.svelte';
	import ChannelGuide from '$lib/components/ChannelGuide.svelte';
	import ModeToggle from '$lib/components/ModeToggle.svelte';
</script>

<div class="app-container" data-mode={$mode}>
	<ModeToggle />
	<ChannelGuide />
	<ChannelPlayer />
</div>

<style>
	.app-container {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: #000;
		color: #fff;
		font-family: system-ui, sans-serif;
		overflow: hidden;
	}

	.app-container[data-mode='kids'] {
		/* Bright, playful — coming soon */
	}

	.app-container[data-mode='normal'] {
		/* Clean, professional — coming soon */
	}

	.app-container[data-mode='adult'] {
		/* Dark, edgy — coming soon */
	}
</style>
