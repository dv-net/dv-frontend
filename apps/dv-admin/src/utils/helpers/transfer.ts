// Get the correct declension of the word "task"
export const getTaskDeclension = (number: number): string => {
	const lastDigit = number % 10;
	const lastTwoDigits = number % 100;

	if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
		return "Tasks.genitive";
	} else if (lastDigit === 1) {
		return "Tasks.single";
	} else if (lastDigit >= 2 && lastDigit <= 4) {
		return "Tasks.plural";
	} else {
		return "Tasks.genitive";
	}
};
