<script setup lang="ts">
	import { onMounted, ref } from "vue";
	import { UiLink } from "@dv.net/ui-kit";

	const { type } = defineProps<{
		type: "error" | "store-disabled";
	}>();

	const errorImgSrc = ref<string>("");

	onMounted(() => {
		void import("@pay-shared/assets/images/error.webp").then((module) => {
			errorImgSrc.value = module.default;
		});
	});
</script>

<template>
	<div class="screen">
		<div class="error">
			<div class="error__img">
				<img v-if="errorImgSrc" :src="errorImgSrc" alt="error" />
			</div>
			<div class="content">
				<h3 class="content__title">{{ $t("Error") }}</h3>
				<p class="content__text">
					{{
						$t(
							type === "store-disabled"
								? "This store has been disabled by the administrator. Try to log in later or contact support"
								: "An unexpected error occurred. Try logging in later or contact support"
						)
					}}
				</p>
				<ui-link href="https://dv.net/#support" target="_blank">
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
				@extend .center;
				border-radius: 12px;
				background: $main-background;
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
