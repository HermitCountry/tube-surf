<script lang="ts">
	import { channels, activeChannel } from '$lib/stores/settings';
</script>

<div class="guide">
	<div class="guide-header">
		<span class="header-cell">#</span>
		<span class="header-cell">Channel</span>
		<span class="header-cell header-description">Description</span>
	</div>
	<div class="guide-list">
		{#each $channels as ch, i}
			<button
				class="guide-row"
				class:active={i === $activeChannel}
				onclick={() => ($activeChannel = i)}
			>
				<span class="cell-num">{i + 1}</span>
				<span class="cell-name">{ch.name}</span>
				<span class="cell-desc">{ch.description ?? ''}</span>
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
		background: rgba(0, 0, 0, 0.85);
		border-right: 1px solid rgba(255, 255, 255, 0.1);
		z-index: 50;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.guide-header {
		display: flex;
		padding: 8px;
		gap: 8px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.15);
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: rgba(255, 255, 255, 0.5);
	}

	.header-cell {
		flex-shrink: 0;
	}

	.header-description {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.guide-list {
		flex: 1;
		overflow-y: auto;
	}

	.guide-row {
		display: flex;
		width: 100%;
		padding: 8px;
		gap: 8px;
		background: none;
		border: none;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		color: #fff;
		cursor: pointer;
		font-size: 13px;
		text-align: left;
	}

	.guide-row:hover {
		background: rgba(255, 255, 255, 0.08);
	}

	.guide-row.active {
		background: rgba(255, 255, 255, 0.15);
		border-left: 3px solid #fff;
	}

	.cell-num {
		width: 24px;
		flex-shrink: 0;
		color: rgba(255, 255, 255, 0.4);
	}

	.cell-name {
		width: 100px;
		flex-shrink: 0;
		font-weight: 500;
	}

	.cell-desc {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: rgba(255, 255, 255, 0.6);
	}
</style>
