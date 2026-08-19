<script setup lang="ts">
	import { formatDateList } from "@dv-admin/utils/constants/settings";
	import { UiSelect } from "@dv.net/ui-kit";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { computed, onMounted, ref, watch } from "vue";
	import { getFormatDateFromStorage } from "@dv-admin/utils/helpers/dateParse";
	import { getTimezones } from "@shared/utils/helpers/date";
	import { storeToRefs } from "pinia";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { useGeneralStore } from "@dv-admin/stores/general";
	import { useI18n } from "vue-i18n";
	import { USER } from "@dv-admin/utils/constants/user";

	const { dictionaryTimezones } = storeToRefs(useGeneralStore());
	const { user } = storeToRefs(useAuthStore());
	const { putUser } = useAuthStore();

	const { t } = useI18n();
	const formatDate = ref<string>(getFormatDateFromStorage());

	const selectedDateFormat = computed(
		() => formatDateList.find((item) => item.value === formatDate.value) ?? formatDateList[0]
	);

	watch(formatDate, (value: string) => {
		if (value) localStorage.setItem(USER.DATE_FORMAT, value);
	});

	const timezoneChangeHandler = async () => {
		if (user.value?.location) await putUser(t("Timezone is changed"));
	};

	onMounted(async () => {
		if (!dictionaryTimezones.value.length) {
			dictionaryTimezones.value = getTimezones();
		}
	});
</script>

<template>
	<div class="profile">
		<block-section class="profile__formats">
			<h3 class="global-title-h3">{{ $t("Format settings") }}</h3>
			<div class="inner">
				<div class="inner__item">
					<h4 class="inner__item-title">{{ $t("Date and time format") }}</h4>
					<ui-select v-model="formatDate" :options="formatDateList" size="sm" :teleport="false">
						<template #selected>
							<span>{{ $t(selectedDateFormat.label) }}: {{ selectedDateFormat.value }}</span>
						</template>

						<template #default="{ option }">
							<div class="date-option__top">
								<span>{{ $t(option.label) }}:</span>
								<span class="date-option__pattern">{{ option.value }}</span>
							</div>
							<span class="date-option__example">{{ $t("Example") }}: {{ option.example }}</span>
						</template>
					</ui-select>
				</div>
				<div v-if="user" class="inner__item">
					<h4 class="inner__item-title">{{ $t("Time zone") }}</h4>
					<ui-select
						v-model="user.location"
						:options="dictionaryTimezones"
						isVirtualList
						withSearch
						size="sm"
						@change="timezoneChangeHandler"
					/>
				</div>
			</div>
		</block-section>
	</div>
</template>

<style scoped lang="scss">
	.profile {
		display: flex;
		flex-direction: column;
		&__formats {
			display: flex;
			flex-direction: column;
			gap: 24px;
			max-width: 720px;
			width: 100%;
			.inner {
				display: flex;
				flex-direction: column;
				gap: 24px;
				&__item {
					display: flex;
					align-items: center;
					justify-content: space-between;
					&:deep(.ui-select__wrapper) {
						min-width: 320px;
						width: max-content;
					}
					&:deep(.ui-select__option) {
						padding: 8px 16px;

						> span {
							display: flex;
							flex-direction: column;
							gap: 2px;
						}
					}
					&-title {
						color: $black;
						font-size: 14px;
						font-weight: 500;
						line-height: 16px;
					}
				}
			}
		}
	}

	.date-option {
		&__top {
			display: flex;
			gap: 3px;
			color: $black;
			font-size: 14px;
			font-weight: 700;
			line-height: 20px;
		}

		&__pattern {
			font-weight: 400;
		}

		&__example {
			color: $grey-opacity;
			font-size: 12px;
			font-weight: 400;
			line-height: 16px;
		}
	}
</style>
