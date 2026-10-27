import { defineStore } from "pinia";
import { ref } from "vue";
import { getApiRefundRequests } from "@dv-admin/utils/services/refunds";

export const useRefundsStore = defineStore("refunds", () => {
	const refundRequestsCount = ref(0);

	const loadRefundRequestsCount = async () => {
		try {
			const data = await getApiRefundRequests();
			refundRequestsCount.value = data?.length ?? 0;
		} catch (error) {
			console.error(error);
		}
	};

	return {
		refundRequestsCount,
		loadRefundRequestsCount
	};
});
