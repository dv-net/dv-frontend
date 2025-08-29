<script setup lang="ts">
	import { UiLink } from "@dv.net/ui-kit";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";

	const { errorStore } = storeToRefs(usePayerFormStore());
</script>

<template>
	<div class="screen">
		<div class="error">
			<div class="error__img">
				<img src="@pay/assets/images/error.webp" alt="shield" />
			</div>
			<div class="content">
				<h3 class="content__title">{{ $t("Error") }}</h3>
				<p class="content__text">
					{{
						$t(
							errorStore === "store-disabled"
								? "This store has been disabled by the administrator. Try to log in later or contact support"
								: "An unexpected error occurred. Try logging in later or contact support"
						)
					}}
				</p>
				<ui-link href="https://dv.net#support" target="_blank">
					{{ $t("Helpdesk") }}
				</ui-link>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.screen {
		display: flex;
		flex-direction: column;
		.error {
			display: flex;
			flex-direction: column;
			gap: 24px;
			padding: 24px;
			border-radius: 16px;
			background-color: $form-background;
			&__img {
				border-radius: 12px;
				background: #f3f4f6;
				@extend .center;
			}
			.content {
				display: flex;
				flex-direction: column;
				gap: 16px;
				&__title {
					font-size: 18px;
				}
				&__text {
					color: $main-text-grey-color;
					font-size: 14px;
					font-weight: 400;
				}
			}
		}
	}
</style>
