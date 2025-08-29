export const EMAIL_REGEX = /^((?!\.)[\w-+.]*[^.])@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
export const ADDRESS_REGEX = /^[a-zA-Z0-9_:.-]+$/;
export const ONLY_NUMBER_REGEX = /^-?\d+(\.\d+)?$/;
export const ONLY_LETTERS_AND_NUMBERS_REGEX = /[^1-9,a-z,A-Z]/g;
export const WITHOUT_SLASH_REGEX = /\//g;
export const URL_REGEX =
	"^(https?:\\/\\/)?" +
	"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
	"((\\d{1,3}\\.){3}\\d{1,3}))" +
	"(\\:\\d+)?" +
	"(\\/[-a-z\\d%@_.~+&:]*)*" +
	"(\\?[;&a-z\\d%@_.,~+&:=-]*)?" +
	"(\\#[-a-z\\d_]*)?$";
