<script setup lang="ts">
	import type { IProps } from "@dv-admin/components/ui/blockchainCard/types";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import { useGeneralStore } from "@dv-admin/stores/general";
	import { storeToRefs } from "pinia";
	import { computed } from "vue";
	import { capitalizeFirstLetter } from "@shared/utils/helpers/general";
	import type { IDictionaryCurrency } from "@dv-admin/utils/types/api/apiGo";

	const { dictionary } = storeToRefs(useGeneralStore());

	const { type } = defineProps<IProps>();

	const currentBlockchain = computed<IDictionaryCurrency | undefined>(() => {
		if (!dictionary.value?.available_currencies?.length) return undefined;
		return dictionary.value.available_currencies.find((item) => item.id === type);
	});
</script>

<template>
	<div v-if="currentBlockchain" class="blockchain">
		<blockchain-icon :type="type" />
		<div class="blockchain__text">
			<span class="blockchain__text-black">{{ currentBlockchain.code }}</span>
			<span class="blockchain__text-bold">·</span>
			<span>{{ capitalizeFirstLetter(currentBlockchain.blockchain) }}</span>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.blockchain {
		display: flex;
		align-items: center;
		gap: 8px;
		&__text {
			display: flex;
			align-items: center;
			gap: 4px;
			color: $secondary;
			font-size: 16px;
			font-weight: 400;
			line-height: 20px;
			&-bold {
				font-weight: 700;
			}
			&-black {
				color: $black;
			}
		}
	}
</style>
