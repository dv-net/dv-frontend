import api from "@dv-admin/utils/plugins/api";
import type {
	IChangePasswordRequest,
	INotificationsListResponse,
	IOwnerDataResponse,
	IResetPasswordRequest,
	ISignInRequest,
	ISignUpRequest,
	IUser2FaRequest,
	IUser2FaResponse,
	IUserChangeEmailRequest,
	IUserResponse,
	IUserTgLinkResponse
} from "@dv-admin/utils/types/api/apiGo";

export async function postAuthUser(body = {} as ISignInRequest): Promise<string> {
	const resp = await api.post("/dv-admin/auth/login", body, { suppressNotify: true });
	return resp.data.data.token;
}

export const postApiForgotPassword = async (email: string) => {
	await api.post("/public/user/forgot-password", { email });
};

export const postApiResetPassword = async (body: IResetPasswordRequest) => {
	await api.post("/public/user/reset-password", body);
};

export async function postRegisterUser(body = {} as ISignUpRequest): Promise<string> {
	const resp = await api.post("/dv-admin/auth/register", body);
	return resp.data.data.token;
}

export const postApiProcessingRegisterOwner = async (mnemonic: string) => {
	await api.post("/dv-admin/processing/register-owner", { mnemonic });
};

export async function getApiUser(): Promise<IUserResponse> {
	const resp = await api.get(`/dv-admin/user`);
	return resp.data.data;
}

export const putApiUser = async (body: IUserResponse): Promise<IUserResponse> => {
	const resp = await api.put(`/dv-admin/user`, body);
	return resp.data.data;
};

export const postApiUserChangePassword = async (body: IChangePasswordRequest) => {
	await api.post(`/dv-admin/user/change-password`, body);
};

export const getApiInfoUser2Fa = async (): Promise<IUser2FaResponse> => {
	const resp = await api.get(`/dv-admin/2fa`);
	return resp.data.data;
};

export const postApiUser2FaConfirm = async (body: IUser2FaRequest) => {
	await api.post(`/dv-admin/2fa/confirm`, body);
};

export const postApiUser2FaDisable = async (body: IUser2FaRequest) => {
	await api.post(`/dv-admin/2fa/disable`, body);
};

export const getApiOwnerData = async (): Promise<IOwnerDataResponse> => {
	const resp = await api.get(`/dv-admin/console/owner-data`);
	return resp.data.data;
};

export const getApiMyDvAuthLink = async (): Promise<string> => {
	const resp = await api.get(`/dv-admin/console/auth-link`);
	return resp.data.link;
};

export const postApiInitEmailConfirmation = async () => {
	await api.post(`/dv-admin/user/init-email-confirmation`);
};

export const postApiUserEmailConfirmation = async (code: number | null) => {
	await api.post(`/dv-admin/user/confirm-email`, { code });
};

export const postApiUserInitEmailChange = async () => {
	await api.post(`/dv-admin/user/init-email-change`);
};

export const postApiUserChangeEmail = async (body: IUserChangeEmailRequest) => {
	await api.post(`/dv-admin/user/change-email`, body);
};

export const postApiUserTgLink = async (): Promise<IUserTgLinkResponse> => {
	const resp = await api.post(`/dv-admin/user/tg-link`);
	return resp.data.data;
};

export const getApiNotificationsList = async (): Promise<INotificationsListResponse[]> => {
	const resp = await api.get(`/dv-admin/notifications/list`);
	return resp.data.data;
};

export const patchApiNotifications = async (notifications: INotificationsListResponse[]) => {
	const body = { list: notifications };
	await api.patch(`/dv-admin/notifications/list/update`, body);
};

export const postApiUnpinTgInit = async () => {
	await api.post(`/dv-admin/user/tg-unlink/init`);
};

export const postApiUnpinTgConfirm = async (code: string) => {
	await api.post(`/dv-admin/user/tg-unlink/confirm`, { code });
};
