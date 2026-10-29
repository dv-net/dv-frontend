export interface IUiFormInstance {
	validate: () => boolean | undefined;
	resetValidate: () => void;
}
