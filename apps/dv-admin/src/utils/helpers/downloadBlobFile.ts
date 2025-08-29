export const downloadBlobFile = (file: Blob, fileName: string) => {
	const blob = new Blob([file], { type: "text/plain" });
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = fileName;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
};
