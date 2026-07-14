<script lang="ts">
	import { channels, activeChannel } from '$lib/stores/settings';
</script>

<div class="guide">
	<div class="guide-header">GUIDE</div>
	<div class="guide-list">
		{#each $channels as ch, i}
			<button
				class="guide-row"
				class:active={i === $activeChannel}
				onclick={() => ($activeChannel = i)}
			>
				<span class="cell-num">{String(i + 1).padStart(2, '0')}</span>
				<span class="cell-name">{ch.name}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.guide {
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		width: 320px;
		background: #111;
		border-right: 2px solid #333;
		z-index: 50;
		display: flex;
		flex-direction: column;
		font-family: 'Courier New', monospace;
	}

	.guide-header {
		padding: 16px;
		font-size: 11px;
		letter-spacing: 4px;
		color: #4f4;
		text-transform: uppercase;
		border-bottom: 1px solid rgba(68, 255, 68, 0.15);
		text-shadow: 0 0 6px rgba(68, 255, 68, 0.3);
	}

	.guide-list {
		flex: 1;
		overflow-y: auto;
	}

	.guide-row {
		display: flex;
		width: 100%;
		padding: 10px 16px;
		gap: 12px;
		align-items: center;
		background: none;
		border: none;
		border-bottom: 1px solid rgba(255, 255, 255, 0.04);
		color: #888;
		cursor: pointer;
		font-size: 13px;
		font-family: -apple-system, system-ui, sans-serif;
		text-align: left;
		transition: all 0.1s;
	}

	.guide-row:hover {
		background: rgba(255, 255, 255, 0.04);
		color: #ccc;
	}

	.guide-row.active {
		background: rgba(68, 255, 68, 0.06);
		color: #4f4;
		border-left: 3px solid #4f4;
		padding-left: 13px;
	}

	.cell-num {
		font-size: 12px;
		color: #555;
		min-width: 20px;
		font-family: 'Courier New', monospace;
	}

	.guide-row.active .cell-num {
		color: #4f4;
	}

	.cell-name {
		flex: 1;
		font-weight: 500;
		font-size: 13px;
	}
</style>
