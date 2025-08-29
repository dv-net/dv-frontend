export interface ISupportCard {
	id: number;
	img: string;
	title: string;
	text?: string;
	path?: string;
	buttonText?: string;
	method?: () => void;
}
