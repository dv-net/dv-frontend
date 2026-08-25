<script setup lang="ts">
	import { computed, onMounted } from "vue";
	import { storeToRefs } from "pinia";
	import { useI18n } from "vue-i18n";
	import { UiButton, UiTable } from "@dv.net/ui-kit";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import type { UiPaginationMeta } from "@dv.net/ui-kit/dist/components/UiPagination/types";
	import { useUsersStore } from "@dv-admin/stores/users";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import { USER_ROLES } from "@dv-admin/utils/constants/user";
	import TableVariantA from "@dv-admin/components/ui/tableVariantA/TableVariantA.vue";
	import StatusBadge from "@dv-admin/components/ui/statusBadge/StatusBadge.vue";

	const { t } = useI18n();
	const { adminUsers, adminUsersPagination, adminUsersPage, isLoadingBanOrUnBanUser, isLoading } =
		storeToRefs(useUsersStore());
	const { getAdminUsers, patchAdminUserBan, patchAdminUserUnBan } = useUsersStore();

	const ROLE_LABELS: Record<string, string> = {
		[USER_ROLES.ROOT]: "Root",
		[USER_ROLES.ADMIN]: "Admin",
		[USER_ROLES.USER]: "User",
		[USER_ROLES.SUPPORT]: "Support"
	};

	const headers = computed<UiTableHeader[]>(() => [
		{ name: "created_at", label: t("Date of registration"), width: "180" },
		{ name: "email", label: "Email", width: "250" },
		{ name: "role", label: t("Role"), width: "200" },
		{ name: "banned", label: t("Status"), width: "140" },
		{ name: "actions", label: t("Actions"), width: "140" }
	]);

	const roleLabel = (role: string) => {
		if (!(role in ROLE_LABELS)) return role;
		const label = ROLE_LABELS[role];
		return role === USER_ROLES.ROOT ? label : t(label);
	};
	const roleClass = (role: string) => (role in ROLE_LABELS ? `role--${role}` : "role--user");

	const handleBanUser = async (user_id: string, banned: boolean) => {
		if (banned) {
			await patchAdminUserUnBan(user_id);
			return;
		}
		await patchAdminUserBan(user_id);
	};

	const changePageHandler = async (pagination: UiPaginationMeta) => {
		adminUsersPage.value = pagination.page;
		await getAdminUsers();
	};

	onMounted(getAdminUsers);
</script>

<template>
	<div class="page">
		<h1 class="global-title-h1 mb-32">{{ $t("Users") }}</h1>
		<table-variant-a>
			<ui-table
				row-key="user_id"
				:loading="isLoading"
				:headers="headers"
				:data="adminUsers"
				:meta="adminUsersPagination"
				table-layout="fixed"
				:isShowPerPageSelect="false"
				@change-pagination="changePageHandler"
			>
				<template #body-cell-created_at="{ row }">
					{{ formatDate(row.created_at) }}
				</template>

				<template #body-cell-role="{ row }">
					<div v-if="row.roles?.length" class="roles">
						<span v-for="role in row.roles" :key="role" class="role" :class="roleClass(role)">
							{{ roleLabel(role) }}
						</span>
					</div>
					<span v-else>—</span>
				</template>

				<template #body-cell-banned="{ row }">
					<status-badge
						:label="row.banned ? $t('Banned') : $t('Active')"
						:mode="row.banned ? 'negative' : 'positive'"
					/>
				</template>

				<template #body-cell-actions="{ row }">
					<ui-button
						size="sm"
						type="secondary"
						:left-icon-name="row.banned ? 'done' : 'block'"
						left-icon-size="md"
						:loading="isLoadingBanOrUnBanUser[row.user_id]"
						@click="handleBanUser(row.user_id, row.banned)"
					>
						{{ row.banned ? $t("Unban") : $t("Ban") }}
					</ui-button>
				</template>
			</ui-table>
		</table-variant-a>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
	}

	.roles {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.role {
		display: inline-flex;
		align-items: center;
		height: 28px;
		padding: 0 12px;
		border-radius: 8px;
		box-sizing: border-box;
		font-size: 13px;
		font-weight: 500;
		line-height: 16px;
		letter-spacing: 0.01em;
		white-space: nowrap;

		&--root {
			color: #8a4b00;
			background: linear-gradient(180deg, #fff6e8 0%, #ffefd6 100%);
			box-shadow: inset 0 0 0 1px rgba(255, 158, 0, 0.22);
		}

		&--admin {
			color: #0b5f8a;
			background: linear-gradient(180deg, #eef7fd 0%, #e3f1fb 100%);
			box-shadow: inset 0 0 0 1px rgba(22, 126, 180, 0.2);
		}

		&--support {
			color: #5b3d99;
			background: linear-gradient(180deg, #f6f1fc 0%, #efe7fa 100%);
			box-shadow: inset 0 0 0 1px rgba(124, 77, 180, 0.18);
		}

		&--user {
			color: rgba(48, 51, 69, 1);
			background: linear-gradient(180deg, #f8f9fb 0%, #f1f3f7 100%);
			box-shadow: inset 0 0 0 1px rgba(48, 51, 69, 0.1);
		}
	}
</style>
