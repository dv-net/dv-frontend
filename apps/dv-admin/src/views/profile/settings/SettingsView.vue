<script setup lang="ts">
	import { DATE_FORMATS, formatDateList } from "@dv-admin/utils/constants/settings";
	import { UiSelect } from "@dv.net/ui-kit";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { onMounted, ref, watch } from "vue";
	import { getFormatDateFromStorage, getTimezones } from "@dv-admin/utils/helpers/dateParse";
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
					<ui-select v-model="formatDate" :options="formatDateList" size="sm" popperClass="date-profile-select">
						<template #selected="{ option }: any">
							<span>{{ $t(option.label) }}</span>
						</template>

						<template #default="{ option }">
							<template v-if="option.label === 'European'">
								<div class="top">
									<span>{{ $t(option.label) }}:</span>
									<span class="date-opacity">{{ DATE_FORMATS.RU_DATETIME }}</span>
								</div>
								<span class="bottom">{{ $t("Example") }}: 31.12.2025, 23:59</span>
							</template>
							<template v-else>
								<div class="top">
									<span>{{ $t(option.label) }}:</span>
									<span class="date-opacity">{{ DATE_FORMATS.US_DATETIME_AMPM }}</span>
								</div>
								<span class="bottom">{{ $t("Example") }}: 10-02-2025, 10:59 AM/PM</span>
							</template>
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
</style>
