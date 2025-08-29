import "vite/client";


import "axios";

declare module "axios" {
	export interface AxiosRequestConfig {
		suppressNotify?: boolean;
	}
}
