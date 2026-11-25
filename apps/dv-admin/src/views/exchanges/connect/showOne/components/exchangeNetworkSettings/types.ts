export interface IUiFormInstance {
	validate: () => boolean | undefined;
	resetValidate: () => void;
}

export interface IExchangeNetworkSettingsExpose {
	save: () => Promise<boolean>;
}
