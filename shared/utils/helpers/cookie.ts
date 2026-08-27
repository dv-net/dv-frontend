import { useCookies } from "vue3-cookies";

const { cookies } = useCookies();

export const removeCookie = (name: string) => {
	cookies.remove(name, "/");
};

export const setCookie = (name: string, value: string, expireTimes: string | number | Date = 0) => {
	cookies.set(name, value, expireTimes, "/", undefined, false, "Lax");
};

export const getCookie = (name: string): string | null => {
	const value = cookies.get(name);
	return value ? value : null;
};
