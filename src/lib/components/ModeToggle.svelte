<script lang="ts">
	import { mode, type ContentMode } from '$lib/stores/settings';

	const modes: { value: ContentMode; label: string; icon: string }[] = [
		{ value: 'kids', label: 'Kids', icon: '🌈' },
		{ value: 'normal', label: 'Normal', icon: '🌍' },
		{ value: 'adult', label: 'Adult', icon: '🔥' },
	];

	function setMode(m: ContentMode) {
		$mode = m;
	}
</script>

<div class="mode-toggle">
	{#each modes as m}
		<button
			class="mode-btn"
			class:active={$mode === m.value}
			onclick={() => setMode(m.value)}
		>
			<span class="icon">{m.icon}</span>
			<span class="label">{m.label}</span>
		</button>
	{/each}
</div>

<style>
	.mode-toggle {
		position: fixed;
		top: 12px;
		right: 12px;
		display: flex;
		gap: 4px;
		z-index: 100;
	}

	.mode-btn {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: #fff;
		padding: 6px 12px;
		border-radius: 6px;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 13px;
		transition: all 0.15s;
	}

	.mode-btn:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.mode-btn.active {
		background: rgba(255, 255, 255, 0.25);
		border-color: rgba(255, 255, 255, 0.5);
	}
</style>
