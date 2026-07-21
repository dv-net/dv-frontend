<script setup lang="ts">
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import IconUsers from "@dv-admin/components/icons/admin/IconUsers.vue";
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Admin')" back-name-route="admin" />
		<h1 class="global-title-h2 mt-24 mb-32">{{ $t("Users") }}</h1>
		<block-section mode="white" class="placeholder">
			<div class="placeholder__icon">
				<icon-users />
			</div>
			<p class="placeholder__title">{{ $t("Under development") }}</p>
			<p class="placeholder__text">{{ $t("Coming soon") }}</p>
		</block-section>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
	}

	.placeholder {
		@extend .center;
		flex-direction: column;
		gap: 12px;
		min-height: 360px;
		padding: 48px 24px;
		text-align: center;

		&__icon {
			@extend .center;
			width: 72px;
			height: 72px;
			margin-bottom: 8px;
			border-radius: 20px;
			background-color: rgba(22, 126, 180, 0.07);
			color: rgb(22, 126, 180);

			:deep(svg) {
				width: 32px;
				height: 32px;
			}
		}

		&__title {
			margin: 0;
			color: $black;
			font-size: 24px;
			font-weight: 500;
			line-height: 28px;
		}

		&__text {
			margin: 0;
			color: $grey-opacity;
			font-size: 16px;
			font-weight: 500;
			line-height: 20px;
		}
	}
</style>
