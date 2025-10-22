<script setup lang="ts">
	import type { IAddressBookCurrencies, IAddressBookList } from "@dv-admin/utils/types/schemas";
	import { ADDRESS_BOOK_TYPES } from "@dv-admin/utils/constants/addressBook";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import TooltipHelper from "@dv-admin/components/ui/tooltipHelper/TooltipHelper.vue";
	import {
		capitalizeFirstLetter,
		changeChainBsc,
		getCurrentBlockchain,
		getCurrentCoin
	} from "@shared/utils/helpers/general.ts";

	const { row } = defineProps<{ row: IAddressBookList }>();

	const getFilteredCurrencies = (currencies: IAddressBookCurrencies[], blockchain: string) =>
		currencies
			.filter((c) => c.currency_id.toLowerCase().includes(blockchain === "bsc" ? "bnbsmartchain" : blockchain))
			.sort((a, b) => a.currency_id.localeCompare(b.currency_id));
</script>

<template>
	<div v-if="row.type === ADDRESS_BOOK_TYPES.REGULAR" class="flex flex-y-center gap-8">
		<template v-if="row.currency_id">
			<div class="fz-16 flex flex-y-center gap-4">
				<span>{{ getCurrentCoin(row.currency_id) }}</span>
				<span class="grey-opacity">|</span>
				<span>{{ changeChainBsc(getCurrentBlockchain(row.currency_id)) }}</span>
			</div>
			<blockchain-icon :type="row.currency_id" width="20px" height="20px" />
		</template>
		<span v-else>—</span>
	</div>

	<div v-else-if="row.type === ADDRESS_BOOK_TYPES.UNIVERSAL" class="flex flex-y-center gap-8">
		<span class="fz-16 flex-shrink-0">{{ row.blockchain ? capitalizeFirstLetter(row.blockchain) : "—" }}</span>
		<span class="grey-opacity">|</span>
		<div v-if="row.currencies" class="flex flex-y-center gap-4" style="flex-wrap: wrap">
			<blockchain-icon
				v-for="item in row.currencies"
				:key="item.currency_id"
				:type="item.currency_id"
				width="20px"
				height="20px"
			/>
		</div>
	</div>

	<div v-else-if="row.type === ADDRESS_BOOK_TYPES.EVM" class="flex flex-y-center gap-4">
		<span class="fz-16">{{ $t("All EVM blockchains") }}</span>
		<tooltip-helper
			v-if="row.blockchains"
			:title="$t('All EVM blockchains')"
			popper-class="address-book-evm"
		>
			<template #infoText>
				<div class="flex flex-column gap-8 p-10">
					<div v-for="item in row.blockchains" :key="item" class="flex flex-y-center gap-8">
						<span class="fz-16">{{ capitalizeFirstLetter(item) }}</span>
						<span>|</span>
						<div v-if="row.currencies" class="flex flex-y-center gap-4">
							<span
								v-for="(el, index) in getFilteredCurrencies(row.currencies, item)"
								:key="el.currency_id"
								class="currency-label"
								:class="`background-${index}`"
							>
								{{ getCurrentCoin(el.currency_id) }}
							</span>
						</div>
					</div>
				</div>
			</template>
		</tooltip-helper>
	</div>

	<span v-else>—</span>
</template>

<style scoped lang="scss">
	.grey-opacity {
		color: $grey-opacity;
	}
</style>
