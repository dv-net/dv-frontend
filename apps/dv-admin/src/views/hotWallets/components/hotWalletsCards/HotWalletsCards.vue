<script setup lang="ts">
	import { storeToRefs } from "pinia";
	import { useHotWalletsStore } from "@dv-admin/stores/hotWallets";
	import NotFoundMessage from "@dv-admin/components/ui/notFoundMessage/NotFoundMessage.vue";
	import { UiSkeleton, UiPagination } from "@dv.net/ui-kit";
	import Card from "@dv-admin/views/hotWallets/components/hotWalletsCards/components/Card.vue";

	const { wallets, walletsPagination, isLoading } = storeToRefs(useHotWalletsStore());
	const { getWallets } = useHotWalletsStore();
</script>

<template>
	<div class="cards">
		<ui-skeleton
			v-if="isLoading"
			:rows="6"
			:row-height="150"
			:item-border-radius="16"
			:rows-gap="12"
			class="skeleton"
			first-color="var(--color-background-tertiary)"
			second-color="var(--color-background-secondary)"
		/>

		<template v-else>
			<div v-if="wallets.length" class="cards__inner">
				<card v-for="item in wallets" :key="item.id" :model-value="item" />
			</div>

			<not-found-message v-else size="lg" />
		</template>
		<div
			v-if="
				wallets.length &&
				walletsPagination &&
				typeof walletsPagination.total === 'number' &&
				walletsPagination.total > walletsPagination.perPage
			"
			class="cards__pagination"
		>
			<ui-pagination
				:per-page="walletsPagination.perPage"
				:total="walletsPagination.total"
				:isShowPerPageSelect="false"
				v-model:page="walletsPagination.page"
				@update:page="getWallets('pagination')"
			/>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.cards {
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 100%;

		&__inner {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 12px;
		}

		&__pagination {
			display: flex;
			justify-content: flex-end;

			&:deep(.el-pagination) {
				.el-pager li,
				.btn-prev,
				.btn-next {
					border-radius: 6px;
				}

				.is-active {
					background-color: $blue !important;
				}
			}
		}

		.skeleton {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
