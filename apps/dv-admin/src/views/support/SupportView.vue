<script setup lang="ts">
	import { ref } from "vue";
	import type { ISupportCard } from "@dv-admin/views/support/types";
	import imgTg from "@dv-admin/assets/images/support/imgTg.png";
	import imgWechat from "@dv-admin/assets/images/support/imgWechat.png";
	import imgChat from "@dv-admin/assets/images/support/imgChat.png";
	import Card from "@dv-admin/views/support/components/Card.vue";
	import TicketsTable from "@dv-admin/views/support/components/TicketsTable.vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { UiButton } from "@dv.net/ui-kit/dist";

	const data = ref<ISupportCard[]>([
		{
			id: 1,
			img: imgTg,
			title: "Telegram",
			path: "https://t.me/dv_net_support_bot",
			text: "@dv_net_support_bot",
			buttonText: "Contact"
		},
		{
			id: 2,
			img: imgWechat,
			title: "WeChat",
			path: "https://u.wechat.com/kEt6Gs4wieAAvTogzfr2Bpc?s=2",
			text: "dvnnet"
		},
		{
			id: 3,
			img: imgChat,
			title: "Online chat",
			buttonText: "Start "
		}
	]);
</script>

<template>
	<div class="page">
		<h1 class="global-title-h1">{{ $t("Support") }}</h1>

		<div class="support-block">
			<block-section mode="grey-border" padding="none">
				<div class="support-block__header">
					<div class="flex flex-column gap-8">
						<h2 class="global-title-h2">{{ $t("Technical support") }}</h2>
						<span class="support-block__description">
							{{ $t("If you have any difficulties working with the service, we are always ready to help") }}
						</span>
					</div>
					<ui-button mode="neutral" disabled>
						{{ $t("Create ticket") }}
						<span class="support-block__button-ticket">{{ $t("Fast answer") }}</span>
					</ui-button>
				</div>

				<div class="cards">
					<card v-for="item in data" :key="item.id" :item="item" />
				</div>
			</block-section>
		</div>

		<TicketsTable />
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 32px;

		.support-block {
			&__header {
				display: flex;
				width: 100%;
				justify-content: space-between;
				align-items: center;
				padding: 24px;
				border-bottom: 1px solid #e1e8f1;
			}

			&__description {
				color: #a4a5b1;
				font-weight: 400;
				font-size: 16px;
				line-height: 20px;
			}

			&__button-ticket {
				position: absolute;
				top: -1px;
				right: -1px;
				border-top-right-radius: inherit;
				border-bottom-left-radius: 24px;
				background: linear-gradient(135deg, #17c7ff 0%, #1346fd 100%);
				padding: 1px 8px;
				font-size: 8px;
				line-height: 125%;
			}

			.cards {
				display: grid;
				background-color: $white;
				align-items: start;
				grid-template-columns: 1fr 1fr 1fr;
				gap: 15px;
				padding: 20px 24px;
				border-radius: 0 0 16px 16px;
			}
		}
	}
</style>
