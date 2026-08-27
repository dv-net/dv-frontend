export const EMAIL_REGEX = /^((?!\.)[\w-+.]*[^.])@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const ADDRESS_REGEX = /^[a-zA-Z0-9_:.-]+$/;
export const ONLY_NUMBER_REGEX = /^-?\d+(\.\d+)?$/;
export const ONLY_LETTERS_AND_NUMBERS_REGEX = /[^1-9,a-z,A-Z]/g;
export const WITHOUT_SLASH_REGEX = /\//g;
export const IP_V4_REGEX =
	/^(?:((25[0-5])|(2[0-4]\d)|(1\d{2})|([1-9]?\d))\.){3}((25[0-5])|(2[0-4]\d)|(1\d{2})|([1-9]?\d))$/;
export const HTTP_PROTOCOL_REGEX = /^https?:\/\//i;
export const URL_REGEX =
	"^(https?:\\/\\/)?" +
	"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
	"((\\d{1,3}\\.){3}\\d{1,3}))" +
	"(\\:\\d+)?" +
	"(\\/[-a-z\\d%@_.~+&:]*)*" +
	"(\\?[;&a-z\\d%@_.,~+&:=-]*)?" +
	"(\\#[-a-z\\d_]*)?$";

/** 57346 → 57 346 */
export const THOUSANDS_SEPARATOR_REGEX = /\B(?=(\d{3})+(?!\d))/g;
