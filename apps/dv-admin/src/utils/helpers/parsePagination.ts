import type { IPagination } from "@dv-admin/utils/types/api/apiGo";
import type { UItableMeta } from "@dv.net/ui-kit/dist/components/UiTable/types";

export const parsePagination = ({ page, page_size, total }: IPagination) => {
	return {
		page,
		perPage: page_size,
		total
	} as UItableMeta;
};
