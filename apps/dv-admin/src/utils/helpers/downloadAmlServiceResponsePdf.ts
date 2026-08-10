import { jsPDF } from "jspdf";

const formatServiceResponse = (serviceResponse: string): string => {
	try {
		return JSON.stringify(JSON.parse(serviceResponse), null, 2);
	} catch {
		return serviceResponse;
	}
};

export const downloadAmlServiceResponsePdf = (serviceResponse: string, fileName = "aml-report.pdf") => {
	const doc = new jsPDF({ unit: "pt", format: "a4" });
	const margin = 40;
	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();
	const maxWidth = pageWidth - margin * 2;
	const lineHeight = 14;
	const content = formatServiceResponse(serviceResponse);
	const lines = doc.splitTextToSize(content || "—", maxWidth) as string[];

	let cursorY = margin;
	doc.setFont("courier", "normal");
	doc.setFontSize(10);

	for (const line of lines) {
		if (cursorY + lineHeight > pageHeight - margin) {
			doc.addPage();
			cursorY = margin;
		}
		doc.text(line, margin, cursorY);
		cursorY += lineHeight;
	}

	doc.save(fileName);
};
