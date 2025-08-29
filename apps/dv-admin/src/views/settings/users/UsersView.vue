<script setup lang="ts">
	import { computed, onMounted } from "vue";
	import { useUsersStore } from "@dv-admin/stores/users";
	import { storeToRefs } from "pinia";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import { UiIcon, UiButton, UiTable } from "@dv.net/ui-kit";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import { useI18n } from "vue-i18n";

	const { adminUsers, isLoadingBanOrUnBanUser, isLoading } = storeToRefs(useUsersStore());
	const { getAdminUsers, patchAdminUserBan, patchAdminUserUnBan } = useUsersStore();

	const { t } = useI18n();
	const headers = computed<UiTableHeader[]>(() => [
		{ name: "email", label: "E-mail" },
		{ name: "created_at", label: `${t("Date of registration")}` },
		{ name: "role", label: "Role", width: "170" },
		{ name: "banned", label: `${t("Status")}`, width: "120" },
		{ name: "actions", label: `${t("Actions")}`, width: "120" }
	]);

	const handleBanUser = async (user_id: string, banned: boolean) => {
		banned ? await patchAdminUserUnBan(user_id) : await patchAdminUserBan(user_id);
	};

	onMounted(async () => {
		await getAdminUsers();
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Settings')" back-name-route="settings" />
		<h1 class="global-title-h2 mt-24 mb-32">{{ $t("Users") }}</h1>
		<ui-table :loading="isLoading" :headers="headers" :data="adminUsers" highlight-row="even" table-layout="fixed">
			<template #body-cell-created_at="{ row }">
				{{ formatDate(row.created_at) }}
			</template>

			<template #body-cell-role="{ row }">
				<div class="table__roles">
					<span v-for="role in row.roles" :key="role">
						{{ role }}
					</span>
				</div>
			</template>

			<template #body-cell-banned="{ row }">
				<span>
					<ui-icon v-if="row.banned" type="400" name="close" color="#DD4C1E" />
					<ui-icon v-else type="400" name="done" color="#1F9649" />
				</span>
			</template>

			<template #body-cell-actions="{ row }">
				<div class="flex">
					<ui-button
						size="sm"
						type="secondary"
						:loading="isLoadingBanOrUnBanUser[row.user_id]"
						@click="handleBanUser(row.user_id, row.banned)"
					>
						{{ row.banned ? $t("Unban") : $t("Ban") }}
					</ui-button>
				</div>
			</template>
		</ui-table>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		.table {
			&__roles {
				display: flex;
				flex-wrap: wrap;
				gap: 4px;
			}
		}
	}
</style>
