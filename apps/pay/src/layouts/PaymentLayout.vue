<script setup lang="ts">
	import IconLogo from "@pay/components/icons/IconLogo.vue";
	import LangSelect from "@pay/components/ui/langSelect/LangSelect.vue";
</script>

<template>
	<div class="payment-layout">
		<header class="header">
			<div class="container">
				<div class="header__inner">
					<icon-logo />
					<lang-select for-header />
				</div>
			</div>
		</header>
		<main class="main">
			<div class="container">
				<slot />
			</div>
		</main>
	</div>
</template>

<style scoped lang="scss">
	.payment-layout {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
	}
	.container {
		max-width: $max-width-container + px;
		width: 100%;
		margin: 0 auto;
		flex-grow: 1;
		display: flex;
		padding: 0 $padding-main + px;
	}
	.header {
		min-height: 56px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		&__inner {
			flex-grow: 1;
			display: flex;
			justify-content: space-between;
			align-items: center;
			&:deep(.ui-languages--trigger) {
				height: 35px;
			}
		}
	}
	.main {
		flex-grow: 1;
		display: flex;
		padding: 40px 0;
	}
</style>
