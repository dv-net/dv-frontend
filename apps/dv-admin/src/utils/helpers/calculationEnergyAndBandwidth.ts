import type { IProcessingWalletsResponse } from "@dv-admin/utils/types/api/apiGo";

export const calculationEnergyAndBandwidth = (
	data: IProcessingWalletsResponse[],
	type: "energy" | "bandwidth"
): { widthUse: number; meaningStripe: number } => {
	const find: IProcessingWalletsResponse | undefined = data.find((item) => item.currency.id === "TRX.Tron");
	if (!find) {
		return { widthUse: 0, meaningStripe: 0 };
	}
	const total: number =
		Number(
			type === "energy"
				? find?.additional_data?.tron_data?.total_energy
				: find?.additional_data?.tron_data?.total_bandwidth
		) || 0;
	const totalUsed: number =
		Number(
			type === "energy"
				? find?.additional_data?.tron_data?.total_used_energy
				: find?.additional_data?.tron_data?.total_used_bandwidth
		) || 0;

	const difference: number = total - totalUsed;
	const greenBarCalculation: number = difference > 0 ? difference : 0;
	const widthUse = total ? (greenBarCalculation / total) * 100 : 0;
	return { widthUse, meaningStripe: difference };
};
