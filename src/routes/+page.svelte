<script lang="ts">
	import { mode, channels, activeChannel, type Channel } from '$lib/stores/settings';
	import ChannelPlayer from '$lib/components/ChannelPlayer.svelte';
	import ChannelGuide from '$lib/components/ChannelGuide.svelte';
	import ModeToggle from '$lib/components/ModeToggle.svelte';

	// Prelinger films — verified non-private with direct MP4 access
	const PRELINGER_CHANNELS: { id: string; title: string; description: string }[] = [
		{ id: 'venice_of_the_north', title: 'Venice of the North', description: 'Classic travelogue about Sweden' },
		{ id: 'vacuum_control', title: 'Vacuum Control', description: 'Industrial training film' },
		{ id: 'Sleepfor1950', title: 'Sleep for Health', description: 'Vintage sleep hygiene film (1950)' },
		{ id: 'HealthYo1953', title: 'Health: Your Posture', description: 'Vintage posture & health film (1953)' },
		{ id: 'FromtheG1954', title: 'From the Ground Up', description: 'Construction & building documentary (1954)' },
		{ id: 'HaveITol1958', title: 'Have I Told You Lately', description: 'Classic 1950s social guidance film' },
	];

	let started = $state(false);

	function tuneIn() {
		started = true;

		const results: Channel[] = PRELINGER_CHANNELS.map((pc, i) => ({
			id: pc.id,
			name: pc.title,
			collection: 'prelinger',
			identifier: pc.id,
			description: pc.description,
			favorited: false,
			hidden: false,
		}));

		channels.set(results);
		activeChannel.set(0);
	}
</script>

<div class="app-container" data-mode={$mode}>
	{#if !started}
		<div class="welcome-screen">
			<div class="scanline"></div>
			<div class="welcome-content">
				<h1 class="welcome-title">tube-surf</h1>
				<p class="welcome-subtitle">Channel surf the world. Past and present. No algorithms.</p>
				<button class="tune-btn" onclick={tuneIn}>
					📡 Tune In
				</button>
			</div>
		</div>
	{:else}
		<ModeToggle />
		<div class="main-ui">
			<ChannelGuide />
			<ChannelPlayer />
		</div>
	{/if}
</div>

<style>
	.app-container {
		width: 100vw;
		height: 100vh;
		background: #000;
		color: #fff;
		font-family: system-ui, sans-serif;
		overflow: hidden;
	}

	.welcome-screen {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #000;
		z-index: 200;
	}

	.scanline {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			0deg, transparent, transparent 2px,
			rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px
		);
		pointer-events: none;
		animation: scan 8s linear infinite;
	}

	@keyframes scan {
		from { transform: translateY(-100%); }
		to { transform: translateY(100%); }
	}

	.welcome-content {
		text-align: center;
		z-index: 1;
	}

	.welcome-title {
		font-size: 48px;
		font-weight: 700;
		margin: 0 0 8px 0;
		letter-spacing: -1px;
	}

	.welcome-subtitle {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.5);
		margin: 0 0 32px 0;
	}

	.tune-btn {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.3);
		color: #fff;
		padding: 14px 40px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 18px;
		transition: all 0.15s;
	}

	.tune-btn:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.5);
	}

	.main-ui {
		width: 100%;
		height: 100%;
		position: relative;
	}
</style>
