<script setup lang="ts">
	import { UiButton, UiRadioGroup, UiRadio, UiModal, UiInput, UiIcon, UiSkeleton, UiCopyText } from "@dv.net/ui-kit";
	import { computed, ref, watch } from "vue";
	import { useHotWalletsStore } from "@dv-admin/stores/hotWallets";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import { getApiWithdrawalCurrencyRules } from "@dv-admin/services/api/withdrawal";
	import type { IWithdrawalAddressItemResponse } from "@dv-admin/utils/types/api/apiGo";
	import { useI18n } from "vue-i18n";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { debounce } from "chart.js/helpers";
	import { useRouter } from "vue-router";
	import { truncateHash } from "@shared/utils/helpers/general.ts";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import { storeToRefs } from "pinia";

	const router = useRouter();
	const { notify } = useNotifications();
	const { t } = useI18n();
	const { currentBlockchainHotWallets } = storeToRefs(useHotWalletsStore());
	const { postWithdrawMultipleManualOrProcessing } = useHotWalletsStore();

	const props = defineProps<{ currencyId: string }>();
	const isOpen = defineModel<boolean>("isOpen", { required: true, default: false });

	const addressees = ref<IWithdrawalAddressItemResponse[]>([]);
	const filteredAddressees = ref<IWithdrawalAddressItemResponse[]>([]);
	const currentAddress = ref<string | undefined>(undefined);
	const disabledBtn = computed<boolean>(() => !currentAddress.value);
	const isLoading = ref<boolean>(false);
	const isLoadingBtn = ref<boolean>(false);
	const searchInput = ref<string>("");

	const debouncedInput = debounce(() => {
		filteredAddressees.value = addressees.value.filter(
			(address) => address.address.includes(searchInput.value) || address.name?.includes(searchInput.value)
		);
	}, 200);

	const getWithdrawalCurrencyRules = async () => {
		try {
			isLoading.value = true;
			const data = await getApiWithdrawalCurrencyRules(props.currencyId);
			addressees.value = data.addressees;
			filteredAddressees.value = data.addressees;
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoading.value = false;
		}
	};

	const handleSendManual = async () => {
		try {
			isLoadingBtn.value = true;
			await postWithdrawMultipleManualOrProcessing("rules", props.currencyId, currentAddress.value);
			closeModal();
			notify(t("Success"), "success");
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoadingBtn.value = false;
		}
	};

	const closeModal = () => {
		isOpen.value = false;
		currentAddress.value = undefined;
	};

	watch(isOpen, async (value) => {
		if (value) await getWithdrawalCurrencyRules();
	});
</script>

<template>
	<ui-modal v-model="isOpen" @close="closeModal" padding="24">
		<form class="modal" @submit.prevent="handleSendManual">
			<h2 class="global-title-h3">{{ $t("Select a wallet for withdrawal") }}</h2>

			<ui-skeleton v-if="isLoading" :row-height="73" :item-border-radius="8" :rows-gap="4" :rows="4" />

			<div v-else-if="!addressees.length">
				<p>{{ $t("You do not have any wallets specified in the withdrawal rules") }}</p>
				<ui-button
					class="mt-16"
					mode="neutral"
					@click="router.push({ name: 'withdrawal-addresses', params: { currencyId: currentBlockchainHotWallets } })"
				>
					{{ $t("Add addresses to withdrawal rules") }}
				</ui-button>
			</div>

			<template v-else>
				<ui-input
					id="search"
					name="search"
					v-model="searchInput"
					:placeholder="$t('Search by name or address')"
					@input="debouncedInput"
				>
					<template #prepend>
						<ui-icon name="search" type="400" color="#a4a5b1" />
					</template>
				</ui-input>

				<block-section radius="sm" padding="none" class="modal__list-container">
					<div v-if="!filteredAddressees.length" class="p-24">{{ $t("Items not found") }}</div>

					<ui-radio-group v-else class="modal__list" v-model="currentAddress" size="md">
						<ui-radio v-for="item in filteredAddressees" :key="item.id" :value="item.id" class="modal__list-item">
							<div class="flex flex-x-between center">
								<div>
									<h3 class="global-title-h3">{{ item.name }}</h3>

									<div class="flex gap-4">
										{{ truncateHash(item.address, 40) }}
										<ui-copy-text :copied-text="item.address" color-icon="#6B6D80" size-icon="sm" />
									</div>
								</div>

								<div v-if="item.created_at" class="date-block">
									<div>{{ $t("Added") }}</div>
									<div>{{ formatDate(item.created_at, "DD.MM.YYYY") }}</div>
								</div>
							</div>
						</ui-radio>
					</ui-radio-group>
				</block-section>

				<div class="flex gap-8 flex-x-end">
					<ui-button type="secondary" size="lg" :loading="isLoadingBtn" @click="closeModal">
						{{ $t("Cancel.verb") }}
					</ui-button>

					<ui-button size="lg" :disabled="disabledBtn" native-type="submit" :loading="isLoadingBtn">
						{{ $t("Choose") }}
					</ui-button>
				</div>
			</template>
		</form>
	</ui-modal>
</template>

<style scoped lang="scss">
	.modal {
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-width: 600px;

		&__list-container {
			height: fit-content;
			max-height: 300px;
			overflow-y: auto;
		}

		&__list {
			flex-direction: column;
			align-items: flex-start;
			gap: 0;
		}

		&__list-item {
			width: 100%;
			padding: 16px;
			gap: 16px;

			&:not(:last-child) {
				border-bottom: 1px solid #e4e4e4;
			}

			:deep(.ui-radio__label) {
				width: 100%;
			}

			.date-block {
				text-align: center;
				color: #6b6d80;
				font-size: 12px;
				font-weight: 400;
				line-height: 16px;
			}
		}
	}
</style>
