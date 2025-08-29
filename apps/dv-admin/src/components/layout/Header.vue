<script setup lang="ts">
	import IconLogo from "@dv-admin/components/icons/IconLogo.vue";
	import { UiIconButton, UiProfileMenu } from "@dv.net/ui-kit/dist";
	import type { ProfileMenuItem } from "@dv.net/ui-kit/dist/components/UiProfileMenu/types";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { useLayoutStore } from "@dv-admin/stores/layout";
	import LangSelect from "@dv-admin/components/ui/langSelect/LangSelect.vue";
	import { storeToRefs } from "pinia";
	import { computed } from "vue";
	import { useI18n } from "vue-i18n";
	import { useRoute, useRouter } from "vue-router";
	import { formatDollars } from "@shared/utils/helpers/general";
	import IconConfirmEmail from "@dv-admin/components/icons/IconConfirmEmail.vue";
	import { useHotWalletsStore } from "@dv-admin/stores/hotWallets";
	import {
		languageAnimation,
		loginAnimation,
		notificationsAnimation,
		personAnimation,
		securityAnimation,
		telegramAnimation
	} from "@dv.net/ui-kit/dist/helpers/animations-list";
	import TooltipHelper from "@dv-admin/components/ui/tooltipHelper/TooltipHelper.vue";
	import { useAuthEmailSectionStore } from "@dv-admin/stores/auth/authEmailSection";

	const { t } = useI18n();
	const router = useRouter();
	const route = useRoute();
	const { walletBalancesHot } = storeToRefs(useHotWalletsStore());
	const { user, ownerData } = storeToRefs(useAuthStore());
	const { logout } = useAuthStore();
	const { checkEmailCodeSent } = useAuthEmailSectionStore();
	const { isShowModalLanguage } = storeToRefs(useLayoutStore());
	const { toggleMenu } = useLayoutStore();

	const profileMenuList = computed<ProfileMenuItem[][]>(() => [
		[
			{
				name: "email",
				isShow: !user.value?.email_verified_at
			},
			{
				name: "telegram",
				isShow: !ownerData.value?.telegram,
				animationIcon: telegramAnimation,
				label: "Telegram",
				isActive: route.name === "profile-telegram",
				action: () => router.push({ name: "profile-telegram" })
			},
			{
				name: "lock",
				animationIcon: securityAnimation,
				label: t("Email, Password and 2FA"),
				isActive: route.name === "profile-personal-data",
				action: () => router.push({ name: "profile-personal-data" })
			}
		],
		[
			{
				name: "notifications",
				animationIcon: notificationsAnimation,
				label: t("Notifications"),
				isActive: route.name === "profile-notifications",
				action: () => router.push({ name: "profile-notifications" })
			},
			{
				name: "person",
				animationIcon: personAnimation,
				label: t("Profile"),
				isActive: route.name === "profile-settings",
				action: () => router.push({ name: "profile-settings" })
			},
			{
				name: "language",
				animationIcon: languageAnimation,
				label: "Language",
				action: () => (isShowModalLanguage.value = true)
			}
		],
		[
			{
				name: "login",
				animationIcon: loginAnimation,
				label: t("Log Out"),
				action: logout
			}
		]
	]);

	const goToProfilePersonalData = async (closeMenu: () => void) => {
		if (route.name !== "profile-personal-data") {
			await checkEmailCodeSent("confirm", t("Code sent"));
			await router.push({ name: "profile-personal-data" });
		}
		closeMenu();
	};
</script>

<template>
	<div class="header">
		<div class="header__left">
			<ui-icon-button size="lg" type="clear" icon-name="menu  1" icon-type="100" @click="toggleMenu" />
			<icon-logo class="header__logo" @click="router.push({ name: 'dashboard' })" />
		</div>
		<div v-if="walletBalancesHot" class="header__balance">
			<span class="header__balance-text">{{ $t("On hot wallets") }}</span>
			<span>
				<span class="header__balance-price">
					{{
						parseFloat(walletBalancesHot) > 0 && parseFloat(walletBalancesHot) < 1
							? formatDollars(walletBalancesHot).replace(/\..*$/, "")
							: formatDollars(walletBalancesHot)
					}}
				</span>
				<span
					v-if="parseFloat(walletBalancesHot) >= 0.01 && parseFloat(walletBalancesHot) < 1"
					class="header__balance-price-fractional"
				>
					{{ formatDollars(walletBalancesHot).replace(/^.*?(?=\.)/, "") }}
				</span>
			</span>
			<tooltip-helper
				style="align-self: center"
				:title="$t('Balance')"
				:text="`${$t('This is the current balance of funds in your hot wallets')}.`"
			/>
		</div>
		<div class="header__profile">
			<lang-select for-header is-hidden />
			<ui-profile-menu
				:user-email="user?.email ?? null"
				:menu-items="profileMenuList"
				:status="user?.email_verified_at ? 'success' : 'reject'"
			>
				<template #menu-item-email="{ closeMenu }">
					<div class="item item--email" @click="goToProfilePersonalData(closeMenu)">
						<icon-confirm-email />
						<span class="item__text">{{ $t("Confirm Email") }}</span>
					</div>
				</template>
			</ui-profile-menu>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.header {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;

		&__left {
			display: flex;
			align-items: center;
		}

		&__logo {
			margin-left: 16px;
			cursor: pointer;
		}

		&__balance {
			display: flex;
			align-items: flex-end;
			gap: 4px;
			color: $black;
			font-size: 14px;
			font-weight: 400;
			line-height: 18px;

			&-text {
				margin-bottom: 3px;
				color: #6b6d80;
			}

			&-price {
				color: #303345;
				line-height: 28px;
				font-size: 20px;
				font-weight: 700;
			}

			&-price-fractional {
				color: #a4a5b1;
			}
		}

		&__profile {
			display: flex;
			align-items: center;
			gap: 25px;

			&:deep(.ui-profile-menu--header) {
				background: url("@dv-admin/assets/images/profile/bg.webp") no-repeat right bottom;
			}

			.item {
				display: flex;
				align-items: center;
				gap: 16px;
				padding: 8px 16px;
				width: 100%;
				font-weight: 400;
				font-size: 14px;
				cursor: pointer;

				&--email {
					background-color: #fff3e0;
				}

				&__text {
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}
		}
	}
</style>
