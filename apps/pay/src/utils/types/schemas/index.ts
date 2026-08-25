export interface IPayerFormTimelineItem {
	id: number;
	label: string;
	isActive: boolean;
	callback?: () => number | false;
}
