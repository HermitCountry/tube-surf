<script lang="ts">
	import { channels, activeChannel, mode } from '$lib/stores/settings';
	import { onMount } from 'svelte';
	import { searchCollection } from '$lib/ia/api';

	onMount(async () => {
		// Seed with some Prelinger films for the prototype
		const result = await searchCollection('prelinger', '', 20);
		$channels = result.items.map((item, i) => ({
			id: item.identifier,
			name: item.title,
			collection: 'prelinger',
			identifier: item.identifier,
			description: item.description,
			favorited: false,
			hidden: false,
		}));
	});
</script>

<svelte:head>
	<title>tube-surf — Channel Guide</title>
</svelte:head>

<div class="guide-page">
	<h1>tube-surf Channel Guide — {$mode === 'kids' ? '🌈' : $mode === 'adult' ? '🔥' : '🌍'} {$mode.toUpperCase()}</h1>

	<div class="channel-grid">
		{#each $channels as ch, i}
			<a href="/?channel={i}" class="channel-card">
				<div class="card-num">{i + 1}</div>
				<div class="card-info">
					<div class="card-title">{ch.name}</div>
					{#if ch.description}
						<div class="card-desc">{ch.description.slice(0, 120)}...</div>
					{/if}
				</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.guide-page {
		padding: 40px;
		max-width: 960px;
		margin: 0 auto;
	}

	h1 {
		font-size: 24px;
		margin-bottom: 24px;
	}

	.channel-grid {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.channel-card {
		display: flex;
		gap: 16px;
		padding: 12px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		text-decoration: none;
		color: #fff;
		transition: background 0.15s;
	}

	.channel-card:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.card-num {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		flex-shrink: 0;
	}

	.card-info {
		flex: 1;
		min-width: 0;
	}

	.card-title {
		font-size: 15px;
		font-weight: 500;
		margin-bottom: 2px;
	}

	.card-desc {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.5);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
