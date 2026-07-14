<script lang="ts">
	import { mode, channels, activeChannel, type Channel } from '$lib/stores/settings';
	import ChannelPlayer from '$lib/components/ChannelPlayer.svelte';
	import ChannelGuide from '$lib/components/ChannelGuide.svelte';
	import ModeToggle from '$lib/components/ModeToggle.svelte';
	import { getDecadeChannels, getRandomFilm } from '$lib/data/ubu';

	// Prelinger channels for NORMAL mode
	const PRELINGER_CHANNELS = [
		{ id: 'venice_of_the_north', name: 'Venice of the North', description: 'Classic travelogue about Sweden' },
		{ id: 'vacuum_control', name: 'Vacuum Control', description: 'Industrial training film' },
		{ id: 'HealthYo1953', name: 'Health: Your Posture', description: 'Vintage posture & health film (1953)' },
		{ id: 'FromtheG1954', name: 'From the Ground Up', description: 'Construction & building documentary (1954)' },
		{ id: 'HaveITol1958', name: 'Have I Told You Lately', description: 'Classic 1950s social guidance film' },
		{ id: 'Sleepfor1950', name: 'Sleep for Health', description: 'Vintage sleep hygiene film (1950)' },
	];

	let started = $state(false);

	function tuneIn() {
		started = true;
		loadChannels();
	}

	function loadChannels() {
		if ($mode === 'adult') {
			// UbuWeb decade channels — each decade is a channel with a random film
			const decadeChannels = getDecadeChannels();
			const results: Channel[] = decadeChannels
				.filter(dc => dc.films.length > 20) // Only decades with decent content
				.slice(0, 10)
				.map(dc => {
					const film = getRandomFilm(dc);
					return {
						id: dc.decade,
						name: dc.label,
						collection: 'ubuweb',
						identifier: film.hls_url || film.mp4_url,
						description: `${film.title} — ${film.filmmaker}${film.year ? ` (${film.year})` : ''}`,
						favorited: false,
						hidden: false,
					};
				});
			channels.set(results);
		} else {
			// Normal/Kids: Prelinger films
			const results: Channel[] = PRELINGER_CHANNELS.map(pc => ({
				id: pc.id,
				name: pc.name,
				collection: 'prelinger',
				identifier: pc.id,
				description: pc.description,
				favorited: false,
				hidden: false,
			}));
			channels.set(results);
		}
		activeChannel.set(0);
	}

	function rescan() { loadChannels(); }

	// Reload channels when mode changes
	$effect(() => {
		if (started) loadChannels();
		$mode; // track changes
	});
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
			<button class="rescan-btn" onclick={rescan}>
				📡 Rescan
			</button>
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

	.app-container[data-mode='adult'] {
		/* Dark, edgy midnight vibes */
	}

	.welcome-screen {
		position: fixed; inset: 0;
		display: flex; align-items: center; justify-content: center;
		background: #000; z-index: 200;
	}

	.scanline {
		position: absolute; inset: 0;
		background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px);
		pointer-events: none;
		animation: scan 8s linear infinite;
	}

	@keyframes scan { from { transform: translateY(-100%); } to { transform: translateY(100%); } }

	.welcome-content { text-align: center; z-index: 1; }

	.welcome-title { font-size: 48px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -1px; }
	.welcome-subtitle { font-size: 14px; color: rgba(255,255,255,0.5); margin: 0 0 32px 0; }

	.tune-btn {
		background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3);
		color: #fff; padding: 14px 40px; border-radius: 8px; cursor: pointer; font-size: 18px;
	}
	.tune-btn:hover { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.5); }

	.main-ui { width: 100%; height: 100%; position: relative; }

	.rescan-btn {
		position: fixed; bottom: 12px; right: 12px; z-index: 100;
		background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
		color: #fff; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px;
	}
	.rescan-btn:hover { background: rgba(255,255,255,0.2); }
</style>
