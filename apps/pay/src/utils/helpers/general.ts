export const loaderShutdown = () => {
	const loaderContainer = document.getElementById("loader");
	const body = document.body;
	const app = document.getElementById("app");
	if (loaderContainer) loaderContainer.style.display = "none";
	if (body) body.style.removeProperty("overflow");
	if (app) app.style.removeProperty("overflow");
}