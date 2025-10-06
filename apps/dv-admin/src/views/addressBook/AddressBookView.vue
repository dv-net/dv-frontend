<script setup lang="ts">
	import { computed, onMounted } from "vue";
	import { useAddressBookStore } from "@dv-admin/stores/addressBook";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse.ts";
	import { UiTable, UiTag, UiConfirm, UiIcon, UiButton, UiCopyText, UiDropdown } from "@dv.net/ui-kit";
	import { storeToRefs } from "pinia";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import { useI18n } from "vue-i18n";
	import { ADDRESS_BOOK_MODE_TYPE, ADDRESS_BOOK_TYPE_LABELS } from "@dv-admin/utils/constants/addressBook";
	import { useRouter } from "vue-router";
	import ShowStatus from "@dv-admin/components/ui/showStatus/ShowStatus.vue";
	import type { IAddressBookList } from "@dv-admin/utils/types/schemas";
	import OutputInfoWithdrawalRules from "@dv-admin/views/addressBook/components/outputInfoWithdrawalRules/OutputInfoWithdrawalRules.vue";
	import OutputInfoBlockchain from "@dv-admin/views/addressBook/components/outputInfoBlockchain/OutputInfoBlockchain.vue";

	const { t } = useI18n();

	const { addressBookList, isLoading, isShowDropdownDeleteAddress } = storeToRefs(useAddressBookStore());
	const { getWithdrawalAddressBook, deleteWithdrawalAddressBook, mapAddressBookRow } = useAddressBookStore();

	const router = useRouter();

	const headers = computed<UiTableHeader[]>(() => [
		{ name: "type", label: t("Address type"), width: "150" },
		{ name: "blockchain", label: t("Blockchain"), width: "200" },
		{ name: "address", label: t("Address"), width: "250" },
		{ name: "name", label: t("Name") },
		{ name: "withdrawal-rules", label: t("Rules"), width: "80" },
		{ name: "submitted_at", label: t("Added"), width: "170" },
		{ name: "actions", width: "50" }
	]);

	const hasAddressDeleteWithdrawalRules = (row: IAddressBookList): boolean => {
		switch (row.type) {
			case "regular":
				return Boolean(row.withdrawal_rule_exists);
			case "universal":
			case "evm":
				return mapAddressBookRow(row).hasAnyWithdrawalRule;
			default:
				return false;
		}
	};

	onMounted(async () => {
		await getWithdrawalAddressBook();
	});
</script>

<template>
	<div class="page">
		<div class="flex flex-y-center flex-x-between">
			<h1 class="global-title-h1">{{ $t("Address book") }}</h1>
			<ui-button mode="neutral" @click="router.push({ name: 'address-book-create' })">
				{{ $t("Add address") }}
			</ui-button>
		</div>
		<ui-table
			:loading="isLoading"
			:headers="headers"
			:data="addressBookList"
			table-layout="fixed"
			highlight-row="even"
			class="table"
		>
			<template #body-cell-type="{ row }">
				<show-status
					v-if="row.type in ADDRESS_BOOK_TYPE_LABELS"
					:mode="ADDRESS_BOOK_MODE_TYPE[row.type]"
					:text="$t(ADDRESS_BOOK_TYPE_LABELS[row.type])"
				/>
				<span v-else>—</span>
			</template>
			<template #body-cell-blockchain="{ row }">
				<output-info-blockchain :row="row" />
			</template>
			<template #body-cell-address="{ row }">
				<div class="flex flex-y-center gap-8">
					<span>{{ row.address }}</span>
					<ui-copy-text :copied-text="row.address" color-icon="#6B6D80" size-icon="sm" />
				</div>
			</template>
			<template #body-cell-name="{ row }">
				<div v-if="row.name || row.tag" class="flex flex-column gap-8">
					<span v-if="row.name" class="fz-16">{{ row.name }}</span>
					<ui-tag v-if="row.tag" mode="neutral" :text="row.tag" />
				</div>
				<span v-else>—</span>
			</template>
			<template #body-cell-submitted_at="{ row }">
				{{ formatDate(row.submitted_at) }}
			</template>
			<template #body-cell-withdrawal-rules="{ row }">
				<output-info-withdrawal-rules :row="row" />
			</template>
			<template #body-cell-actions="{ row }">
				<div v-if="hasAddressDeleteWithdrawalRules(row)">
					<ui-dropdown
						trigger="click"
						popper-class="global-dropdown__wallets"
						placement="bottom-end"
						v-model="isShowDropdownDeleteAddress[`${row.type}${row.address}`]"
					>
						<template #reference>
							<ui-icon class="delete-btn" name="delete" type="400" color="a4a5b1" size="md" />
						</template>
						<template #default>
							<div class="global-dropdown__wallets-list">
								<div class="global-dropdown__wallets-item" @click="deleteWithdrawalAddressBook(row, false)">
									<span>{{ $t("Delete address from address book only") }}</span>
								</div>
								<div class="global-dropdown__wallets-item" @click="deleteWithdrawalAddressBook(row, true)">
									<span>{{ $t("Remove address from address book and withdrawal rules") }}</span>
								</div>
							</div>
						</template>
					</ui-dropdown>
				</div>
				<ui-confirm v-else :method="() => deleteWithdrawalAddressBook(row, false)" :title="$t('Delete address') + '?'">
					<ui-icon class="delete-btn" name="delete" type="400" color="a4a5b1" size="md" />
				</ui-confirm>
			</template>
		</ui-table>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 32px;
		&:deep(.table) {
			.ui-table__body-cell-inner {
				min-height: 52px;
			}
		}
		.delete-btn {
			transition: transform 0.3s ease-in-out;
			@media (hover: hover) {
				&:hover {
					cursor: pointer;
					animation: shake 0.4s ease-in-out;
				}
			}
		}
		@keyframes shake {
			0% {
				transform: translateX(0);
			}
			25% {
				transform: translateX(3px);
			}
			50% {
				transform: translateX(-3px);
			}
			75% {
				transform: translateX(2px);
			}
			100% {
				transform: translateX(0);
			}
		}
	}
</style>
