/**
 * Keyboard layout conversion utility
 * Converts text from different keyboard layouts to English layout based on key positions
 */

// Mapping of keyboard layouts to English QWERTY
// Format: { 'character_in_layout': 'corresponding_english_character' }
const KEYBOARD_LAYOUTS: Record<string, Record<string, string>> = {
	// Russian (Русский)
	russian: {
		'й': 'q', 'ц': 'w', 'у': 'e', 'к': 'r', 'е': 't', 'н': 'y', 'г': 'u', 'ш': 'i', 'щ': 'o', 'з': 'p', 'х': '[', 'ъ': ']',
		'ф': 'a', 'ы': 's', 'в': 'd', 'а': 'f', 'п': 'g', 'р': 'h', 'о': 'j', 'л': 'k', 'д': 'l', 'ж': ';', 'э': '\'',
		'я': 'z', 'ч': 'x', 'с': 'c', 'м': 'v', 'и': 'b', 'т': 'n', 'ь': 'm', 'б': ',', 'ю': '.',
		'Й': 'Q', 'Ц': 'W', 'У': 'E', 'К': 'R', 'Е': 'T', 'Н': 'Y', 'Г': 'U', 'Ш': 'I', 'Щ': 'O', 'З': 'P', 'Х': '{', 'Ъ': '}',
		'Ф': 'A', 'Ы': 'S', 'В': 'D', 'А': 'F', 'П': 'G', 'Р': 'H', 'О': 'J', 'Л': 'K', 'Д': 'L', 'Ж': ':', 'Э': '"',
		'Я': 'Z', 'Ч': 'X', 'С': 'C', 'М': 'V', 'И': 'B', 'Т': 'N', 'Ь': 'M', 'Б': '<', 'Ю': '>',
	},
	// Ukrainian (Українська)
	ukrainian: {
		'й': 'q', 'ц': 'w', 'у': 'e', 'к': 'r', 'е': 't', 'н': 'y', 'г': 'u', 'ш': 'i', 'щ': 'o', 'з': 'p', 'х': '[', 'ї': ']',
		'ф': 'a', 'і': 's', 'в': 'd', 'а': 'f', 'п': 'g', 'р': 'h', 'о': 'j', 'л': 'k', 'д': 'l', 'ж': ';', 'є': '\'',
		'я': 'z', 'ч': 'x', 'с': 'c', 'м': 'v', 'и': 'b', 'т': 'n', 'ь': 'm', 'б': ',', 'ю': '.',
		'Й': 'Q', 'Ц': 'W', 'У': 'E', 'К': 'R', 'Е': 'T', 'Н': 'Y', 'Г': 'U', 'Ш': 'I', 'Щ': 'O', 'З': 'P', 'Х': '{', 'Ї': '}',
		'Ф': 'A', 'І': 'S', 'В': 'D', 'А': 'F', 'П': 'G', 'Р': 'H', 'О': 'J', 'Л': 'K', 'Д': 'L', 'Ж': ':', 'Є': '"',
		'Я': 'Z', 'Ч': 'X', 'С': 'C', 'М': 'V', 'И': 'B', 'Т': 'N', 'Ь': 'M', 'Б': '<', 'Ю': '>',
	},
	// German (Deutsch)
	german: {
		'ü': '[', 'ö': ';', 'ä': '\'',
		'Ü': '{', 'Ö': ':', 'Ä': '"',
		'ß': '-',
	},
	// Spanish (Español)
	spanish: {
		'ñ': ';',
		'Ñ': ':',
	},
	// Portuguese (Português)
	portuguese: {
		'ç': '\'',
		'Ç': '"',
	},
	// Greek (Ελληνικά)
	greek: {
		'ς': 'w', 'ε': 'e', 'ρ': 'r', 'τ': 't', 'υ': 'y', 'θ': 'u', 'ι': 'i', 'ο': 'o', 'π': 'p',
		'α': 'a', 'σ': 's', 'δ': 'd', 'φ': 'f', 'γ': 'g', 'η': 'h', 'ξ': 'j', 'κ': 'k', 'λ': 'l',
		'ζ': 'z', 'χ': 'x', 'ψ': 'c', 'ω': 'v', 'β': 'b', 'ν': 'n', 'μ': 'm',
		'Σ': 'W', 'Ε': 'E', 'Ρ': 'R', 'Τ': 'T', 'Υ': 'Y', 'Θ': 'U', 'Ι': 'I', 'Ο': 'O', 'Π': 'P',
		'Α': 'A', 'Δ': 'D', 'Φ': 'F', 'Γ': 'G', 'Η': 'H', 'Ξ': 'J', 'Κ': 'K', 'Λ': 'L',
		'Ζ': 'Z', 'Χ': 'X', 'Ψ': 'C', 'Ω': 'V', 'Β': 'B', 'Ν': 'N', 'Μ': 'M',
	},
	// Arabic (العربية)
	arabic: {
		'ض': 'q', 'ص': 'w', 'ث': 'e', 'ق': 'r', 'ف': 't', 'غ': 'y', 'ع': 'u', 'ه': 'i', 'خ': 'o', 'ح': 'p',
		'ش': 'a', 'س': 's', 'ي': 'd', 'ب': 'f', 'ل': 'g', 'ا': 'h', 'ت': 'j', 'ن': 'k', 'م': 'l', 'ك': ';',
		'ئ': 'z', 'ء': 'x', 'ؤ': 'c', 'ر': 'v', 'ى': 'b', 'ة': 'n', 'و': 'm', 'ز': ',', 'ظ': '.',
	},
	// Hebrew (עברית)
	hebrew: {
		'/': 'q', '\'': 'w', 'ק': 'e', 'ר': 'r', 'א': 't', 'ט': 'y', 'ו': 'u', 'ן': 'i', 'ם': 'o', 'פ': 'p',
		'ש': 'a', 'ד': 's', 'ג': 'd', 'כ': 'f', 'ע': 'g', 'י': 'h', 'ח': 'j', 'ל': 'k', 'ך': 'l', 'ף': ';',
		'ז': 'z', 'ס': 'x', 'ב': 'c', 'ה': 'v', 'נ': 'b', 'מ': 'n', 'צ': 'm', 'ת': ',', 'ץ': '.',
	},
	// Polish (Polski)
	polish: {
		'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
		'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z',
	},
	// Czech (Čeština)
	czech: {
		'č': 'c', 'ď': 'd', 'ě': 'e', 'ň': 'n', 'ř': 'r', 'š': 's', 'ť': 't', 'ů': 'u', 'ý': 'y', 'ž': 'z',
		'Č': 'C', 'Ď': 'D', 'Ě': 'E', 'Ň': 'N', 'Ř': 'R', 'Š': 'S', 'Ť': 'T', 'Ů': 'U', 'Ý': 'Y', 'Ž': 'Z',
	},
	// Turkish (Türkçe)
	turkish: {
		'ş': 's', 'ğ': 'g', 'ü': 'u', 'ı': 'i', 'ö': 'o', 'ç': 'c',
		'Ş': 'S', 'Ğ': 'G', 'Ü': 'U', 'İ': 'I', 'Ö': 'O', 'Ç': 'C',
	},
	// Korean (한국어)
	korean: {
		'ㅂ': 'q', 'ㅈ': 'w', 'ㄷ': 'e', 'ㄱ': 'r', 'ㅅ': 't', 'ㅛ': 'y', 'ㅕ': 'u', 'ㅑ': 'i', 'ㅐ': 'o', 'ㅔ': 'p',
		'ㅁ': 'a', 'ㄴ': 's', 'ㅇ': 'd', 'ㄹ': 'f', 'ㅎ': 'g', 'ㅗ': 'h', 'ㅓ': 'j', 'ㅏ': 'k', 'ㅣ': 'l',
		'ㅋ': 'z', 'ㅌ': 'x', 'ㅊ': 'c', 'ㅍ': 'v', 'ㅠ': 'b', 'ㅜ': 'n', 'ㅡ': 'm',
	},
	// Bulgarian (Български)
	bulgarian: {
		'я': 'q', 'в': 'w', 'е': 'e', 'р': 'r', 'т': 't', 'ъ': 'y', 'у': 'u', 'и': 'i', 'о': 'o', 'п': 'p', 'ш': '[', 'щ': ']',
		'а': 'a', 'с': 's', 'д': 'd', 'ф': 'f', 'г': 'g', 'х': 'h', 'й': 'j', 'к': 'k', 'л': 'l', ';': ';', '\'': '\'',
		'з': 'z', 'ь': 'x', 'ц': 'c', 'ж': 'v', 'б': 'b', 'н': 'n', 'м': 'm',
		'Я': 'Q', 'В': 'W', 'Е': 'E', 'Р': 'R', 'Т': 'T', 'Ъ': 'Y', 'У': 'U', 'И': 'I', 'О': 'O', 'П': 'P', 'Ш': '{', 'Щ': '}',
		'А': 'A', 'С': 'S', 'Д': 'D', 'Ф': 'F', 'Г': 'G', 'Х': 'H', 'Й': 'J', 'К': 'K', 'Л': 'L',
		'З': 'Z', 'Ь': 'X', 'Ц': 'C', 'Ж': 'V', 'Б': 'B', 'Н': 'N', 'М': 'M',
	},
	// Romanian (Română)
	romanian: {
		'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
		'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ț': 'T',
	},
	// Serbian (Српски) - Cyrillic
	serbian: {
		'љ': 'q', 'њ': 'w', 'е': 'e', 'р': 'r', 'т': 't', 'з': 'y', 'у': 'u', 'и': 'i', 'о': 'o', 'п': 'p', 'ш': '[', 'ђ': ']',
		'а': 'a', 'с': 's', 'д': 'd', 'ф': 'f', 'г': 'g', 'х': 'h', 'ј': 'j', 'к': 'k', 'л': 'l', 'ч': ';', 'ћ': '\'',
		'џ': 'z', 'ж': 'x', 'ц': 'c', 'в': 'v', 'б': 'b', 'н': 'n', 'м': 'm',
		'Љ': 'Q', 'Њ': 'W', 'Е': 'E', 'Р': 'R', 'Т': 'T', 'З': 'Y', 'У': 'U', 'И': 'I', 'О': 'O', 'П': 'P', 'Ш': '{', 'Ђ': '}',
		'А': 'A', 'С': 'S', 'Д': 'D', 'Ф': 'F', 'Г': 'G', 'Х': 'H', 'Ј': 'J', 'К': 'K', 'Л': 'L', 'Ч': ':', 'Ћ': '"',
		'Џ': 'Z', 'Ж': 'X', 'Ц': 'C', 'В': 'V', 'Б': 'B', 'Н': 'N', 'М': 'M',
	},
	// Lithuanian (Lietuvių)
	lithuanian: {
		'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i', 'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z',
		'Ą': 'A', 'Č': 'C', 'Ę': 'E', 'Ė': 'E', 'Į': 'I', 'Š': 'S', 'Ų': 'U', 'Ū': 'U', 'Ž': 'Z',
	},
	// Latvian (Latviešu)
	latvian: {
		'ā': 'a', 'č': 'c', 'ē': 'e', 'ģ': 'g', 'ī': 'i', 'ķ': 'k', 'ļ': 'l', 'ņ': 'n', 'š': 's', 'ū': 'u', 'ž': 'z',
		'Ā': 'A', 'Č': 'C', 'Ē': 'E', 'Ģ': 'G', 'Ī': 'I', 'Ķ': 'K', 'Ļ': 'L', 'Ņ': 'N', 'Š': 'S', 'Ū': 'U', 'Ž': 'Z',
	},
	// Estonian (Eesti)
	estonian: {
		'ä': 'a', 'ö': 'o', 'õ': 'o', 'ü': 'u', 'š': 's', 'ž': 'z',
		'Ä': 'A', 'Ö': 'O', 'Õ': 'O', 'Ü': 'U', 'Š': 'S', 'Ž': 'Z',
	},
	// Hungarian (Magyar)
	hungarian: {
		'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ö': 'o', 'ő': 'o', 'ú': 'u', 'ü': 'u', 'ű': 'u',
		'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ö': 'O', 'Ő': 'O', 'Ú': 'U', 'Ü': 'U', 'Ű': 'U',
	},
	// Slovak (Slovenčina)
	slovak: {
		'á': 'a', 'ä': 'a', 'č': 'c', 'ď': 'd', 'é': 'e', 'í': 'i', 'ĺ': 'l', 'ľ': 'l', 'ň': 'n', 'ó': 'o', 'ô': 'o', 'ŕ': 'r', 'š': 's', 'ť': 't', 'ú': 'u', 'ý': 'y', 'ž': 'z',
		'Á': 'A', 'Ä': 'A', 'Č': 'C', 'Ď': 'D', 'É': 'E', 'Í': 'I', 'Ĺ': 'L', 'Ľ': 'L', 'Ň': 'N', 'Ó': 'O', 'Ô': 'O', 'Ŕ': 'R', 'Š': 'S', 'Ť': 'T', 'Ú': 'U', 'Ý': 'Y', 'Ž': 'Z',
	},
	// Belarusian (Беларуская)
	belarusian: {
		'й': 'q', 'ц': 'w', 'у': 'e', 'к': 'r', 'е': 't', 'н': 'y', 'г': 'u', 'ш': 'i', 'ў': 'o', 'з': 'p', 'х': '[',
		'ф': 'a', 'ы': 's', 'в': 'd', 'а': 'f', 'п': 'g', 'р': 'h', 'о': 'j', 'л': 'k', 'д': 'l', 'ж': ';', 'э': '\'',
		'я': 'z', 'ч': 'x', 'с': 'c', 'м': 'v', 'і': 'b', 'т': 'n', 'ь': 'm', 'б': ',', 'ю': '.',
		'Й': 'Q', 'Ц': 'W', 'У': 'E', 'К': 'R', 'Е': 'T', 'Н': 'Y', 'Г': 'U', 'Ш': 'I', 'Ў': 'O', 'З': 'P', 'Х': '{',
		'Ф': 'A', 'Ы': 'S', 'В': 'D', 'А': 'F', 'П': 'G', 'Р': 'H', 'О': 'J', 'Л': 'K', 'Д': 'L', 'Ж': ':', 'Э': '"',
		'Я': 'Z', 'Ч': 'X', 'С': 'C', 'М': 'V', 'І': 'B', 'Т': 'N', 'Ь': 'M', 'Б': '<', 'Ю': '>',
	},
	// Kazakh (Қазақ)
	kazakh: {
		'й': 'q', 'ц': 'w', 'у': 'e', 'к': 'r', 'е': 't', 'н': 'y', 'г': 'u', 'ш': 'i', 'щ': 'o', 'з': 'p', 'х': '[', 'ъ': ']',
		'ф': 'a', 'ы': 's', 'в': 'd', 'а': 'f', 'п': 'g', 'р': 'h', 'о': 'j', 'л': 'k', 'д': 'l', 'ж': ';', 'э': '\'',
		'я': 'z', 'ч': 'x', 'с': 'c', 'м': 'v', 'и': 'b', 'т': 'n', 'ь': 'm', 'б': ',', 'ю': '.',
		'ә': 'a', 'ғ': 'g', 'қ': 'k', 'ң': 'n', 'ө': 'o', 'ұ': 'u', 'ү': 'u', 'һ': 'h', 'і': 'i',
		'Й': 'Q', 'Ц': 'W', 'У': 'E', 'К': 'R', 'Е': 'T', 'Н': 'Y', 'Г': 'U', 'Ш': 'I', 'Щ': 'O', 'З': 'P', 'Х': '{', 'Ъ': '}',
		'Ф': 'A', 'Ы': 'S', 'В': 'D', 'А': 'F', 'П': 'G', 'Р': 'H', 'О': 'J', 'Л': 'K', 'Д': 'L', 'Ж': ':', 'Э': '"',
		'Я': 'Z', 'Ч': 'X', 'С': 'C', 'М': 'V', 'И': 'B', 'Т': 'N', 'Ь': 'M', 'Б': '<', 'Ю': '>',
		'Ә': 'A', 'Ғ': 'G', 'Қ': 'K', 'Ң': 'N', 'Ө': 'O', 'Ұ': 'U', 'Ү': 'U', 'Һ': 'H', 'І': 'I',
	},
	// Georgian (ქართული)
	georgian: {
		'ქ': 'q', 'წ': 'w', 'ე': 'e', 'რ': 'r', 'ტ': 't', 'ყ': 'y', 'უ': 'u', 'ი': 'i', 'ო': 'o', 'პ': 'p',
		'ა': 'a', 'ს': 's', 'დ': 'd', 'ფ': 'f', 'გ': 'g', 'ჰ': 'h', 'ჯ': 'j', 'კ': 'k', 'ლ': 'l',
		'ზ': 'z', 'ხ': 'x', 'ც': 'c', 'ვ': 'v', 'ბ': 'b', 'ნ': 'n', 'მ': 'm',
	},
	// Armenian (Հայերեն)
	armenian: {
		'ք': 'q', 'ո': 'w', 'է': 'e', 'ր': 'r', 'տ': 't', 'ը': 'y', 'ւ': 'u', 'ի': 'i', 'օ': 'o', 'պ': 'p',
		'ա': 'a', 'ս': 's', 'դ': 'd', 'ֆ': 'f', 'գ': 'g', 'հ': 'h', 'ջ': 'j', 'կ': 'k', 'լ': 'l',
		'զ': 'z', 'խ': 'x', 'ծ': 'c', 'վ': 'v', 'բ': 'b', 'ն': 'n', 'մ': 'm',
	},
	// Mongolian (Монгол)
	mongolian: {
		'ф': 'f', 'ц': 'c', 'у': 'u', 'ж': 'j', 'э': 'e', 'н': 'n', 'г': 'g', 'ш': 's', 'ү': 'v', 'з': 'z', 'к': 'k',
		'й': 'i', 'ы': 'y', 'б': 'b', 'ө': 'o', 'а': 'a', 'х': 'h', 'р': 'r', 'о': 'o', 'л': 'l', 'д': 'd', 'п': 'p',
		'я': 'i', 'ч': 'c', 'ё': 'y', 'с': 's', 'м': 'm', 'и': 'i', 'т': 't', 'ь': 't',
	},
	// Vietnamese (Tiếng Việt) - normalized versions
	vietnamese: {
		'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a', 'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
		'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
		'đ': 'd',
		'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
		'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
		'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
		'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
		'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u', 'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
		'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
		'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A', 'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
		'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
		'Đ': 'D',
		'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E', 'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
		'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
		'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O', 'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
		'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
		'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U', 'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
		'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
	},
	// Thai (ไทย)
	thai: {
		'ๅ': 'q', 'ภ': 'w', 'ถ': 'e', 'ุ': 'r', 'ึ': 't', 'ค': 'y', 'ต': 'u', 'จ': 'i', 'ข': 'o', 'ช': 'p',
		'ฟ': 'a', 'ห': 's', 'ก': 'd', 'ด': 'f', 'เ': 'g', '้': 'h', '่': 'j', 'า': 'k', 'ส': 'l', 'ว': ';',
		'ผ': 'z', 'ป': 'x', 'แ': 'c', 'อ': 'v', 'ิ': 'b', 'ื': 'n', 'ท': 'm', 'ม': ',', 'ใ': '.',
	},
	// Persian (فارسی)
	persian: {
		'ض': 'q', 'ص': 'w', 'ث': 'e', 'ق': 'r', 'ف': 't', 'غ': 'y', 'ع': 'u', 'ه': 'i', 'خ': 'o', 'ح': 'p',
		'ش': 'a', 'س': 's', 'ی': 'd', 'ب': 'f', 'ل': 'g', 'ا': 'h', 'ت': 'j', 'ن': 'k', 'م': 'l', 'ک': ';',
		'ظ': 'z', 'ط': 'x', 'ز': 'c', 'ر': 'v', 'ذ': 'b', 'د': 'n', 'پ': 'm', 'و': ',', 'چ': '.',
	},
	// Bengali (বাংলা)
	bengali: {
		// Standard Bengali keyboard layout
		'ৌ': 'q', 'ৈ': 'w', 'া': 'e', 'ী': 'r', 'ূ': 't', 'ব': 'y', 'হ': 'u', 'গ': 'i', 'দ': 'o', 'জ': 'p', 'ড': '[', '়': ']',
		'ো': 'a', 'ে': 's', '্': 'd', 'ি': 'f', 'ু': 'g', 'প': 'h', 'র': 'j', 'ক': 'k', 'ত': 'l', 'চ': ';', 'ট': '\'',
		'ং': 'z', 'ম': 'x', 'ন': 'c', 'ল': 'b', 'স': 'n', 'য': '.', 'শ': 's', 'ষ': 's',
		// Additional common consonants
		'খ': 'k', 'ঘ': 'g', 'ঙ': 'n', 'ছ': 'c', 'ঝ': 'j', 'ঞ': 'n', 'ঠ': 't', 'ঢ': 'd', 'ণ': 'n',
		'থ': 't', 'ধ': 'd', 'ফ': 'f', 'ভ': 'b',
	},
	// Hindi (हिन्दी) - Devanagari
	hindi: {
		// Standard Hindi keyboard layout (Inscript)
		'ौ': 'q', 'ै': 'w', 'ा': 'e', 'ी': 'r', 'ू': 't', 'ब': 'y', 'ह': 'u', 'ग': 'i', 'द': 'o', 'ज': 'p', 'ड': '[', '़': ']',
		'ो': 'a', 'े': 's', '्': 'd', 'ि': 'f', 'ु': 'g', 'प': 'h', 'र': 'j', 'क': 'k', 'त': 'l', 'च': ';', 'ट': '\'',
		'ं': 'z', 'म': 'x', 'न': 'c', 'व': 'v', 'ल': 'b', 'स': 'n', 'य': '.',
		// Additional common consonants
		'ख': 'k', 'घ': 'g', 'ङ': 'n', 'छ': 'c', 'झ': 'j', 'ञ': 'n', 'ठ': 't', 'ढ': 'd', 'ण': 'n',
		'थ': 't', 'ध': 'd', 'फ': 'f', 'भ': 'b', 'श': 's', 'ष': 's',
	},
	// Danish (Dansk)
	danish: {
		'æ': ';', 'ø': '\'', 'å': '[',
		'Æ': ':', 'Ø': '"', 'Å': '{',
	},
	// Finnish (Suomi)
	finnish: {
		'ä': '\'', 'ö': ';', 'å': '[',
		'Ä': '"', 'Ö': ':', 'Å': '{',
	},
	// Norwegian (Norsk)
	norwegian: {
		'æ': '\'', 'ø': ';', 'å': '[',
		'Æ': '"', 'Ø': ':', 'Å': '{',
	},
	// Swedish (Svenska)
	swedish: {
		'ä': '\'', 'ö': ';', 'å': '[',
		'Ä': '"', 'Ö': ':', 'Å': '{',
	},
	// Italian (Italiano)
	italian: {
		'à': 'a', 'è': 'e', 'é': 'e', 'ì': 'i', 'ò': 'o', 'ù': 'u',
		'À': 'A', 'È': 'E', 'É': 'E', 'Ì': 'I', 'Ò': 'O', 'Ù': 'U',
	},
	// Slovenian (Slovenščina)
	slovenian: {
		'č': 'c', 'š': 's', 'ž': 'z',
		'Č': 'C', 'Š': 'S', 'Ž': 'Z',
	},
	// Chinese (中文) - Pinyin mapping (common romanizations)
	chinese: {
		// This is limited - Chinese input is complex with IME
		// Map some common alternative romanizations
		'ü': 'v', 'Ü': 'V',
	},
	// Japanese (日本語) - Romaji mapping (limited)
	japanese: {
		// Limited support - Japanese input uses complex IME systems
		// Map some hiragana/katakana to romaji equivalents for basic support
		'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
		'か': 'k', 'き': 'k', 'く': 'k', 'け': 'k', 'こ': 'k',
		'さ': 's', 'し': 's', 'す': 's', 'せ': 's', 'そ': 's',
		'た': 't', 'ち': 't', 'つ': 't', 'て': 't', 'と': 't',
		'な': 'n', 'に': 'n', 'ぬ': 'n', 'ね': 'n', 'の': 'n',
		'は': 'h', 'ひ': 'h', 'ふ': 'h', 'へ': 'h', 'ほ': 'h',
		'ま': 'm', 'み': 'm', 'む': 'm', 'め': 'm', 'も': 'm',
		'や': 'y', 'ゆ': 'y', 'よ': 'y',
		'ら': 'r', 'り': 'r', 'る': 'r', 'れ': 'r', 'ろ': 'r',
		'わ': 'w', 'を': 'w', 'ん': 'n',
		// Katakana
		'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
		'カ': 'k', 'キ': 'k', 'ク': 'k', 'ケ': 'k', 'コ': 'k',
		'サ': 's', 'シ': 's', 'ス': 's', 'セ': 's', 'ソ': 's',
		'タ': 't', 'チ': 't', 'ツ': 't', 'テ': 't', 'ト': 't',
		'ナ': 'n', 'ニ': 'n', 'ヌ': 'n', 'ネ': 'n', 'ノ': 'n',
		'ハ': 'h', 'ヒ': 'h', 'フ': 'h', 'ヘ': 'h', 'ホ': 'h',
		'マ': 'm', 'ミ': 'm', 'ム': 'm', 'メ': 'm', 'モ': 'm',
		'ヤ': 'y', 'ユ': 'y', 'ヨ': 'y',
		'ラ': 'r', 'リ': 'r', 'ル': 'r', 'レ': 'r', 'ロ': 'r',
		'ワ': 'w', 'ヲ': 'w', 'ン': 'n',
	},
};

/**
 * Converts text from a specific keyboard layout to English QWERTY
 * @param text - Input text to convert
 * @param layout - Layout mapping object
 * @returns Converted text in English layout
 */
const convertWithLayout = (text: string, layout: Record<string, string>): string => {
	if (!text) return '';
	return text.split('').map(char => layout[char] || char).join('');
};

/**
 * Detects the keyboard layout based on characters in the text
 * @param text - Input text to analyze
 * @returns Layout name or null if not detected
 */
const detectLayout = (text: string): keyof typeof KEYBOARD_LAYOUTS | null => {
	if (!text) return null;
	
	const chars = text.split('');
	
	// Priority order for common layouts (to avoid conflicts between similar scripts)
	const priorityLayouts = ['russian', 'ukrainian', 'arabic', 'hebrew', 'greek', 'hindi', 'thai', 'korean', 'japanese', 'chinese'];
	
	// Check priority layouts first
	for (const layoutName of priorityLayouts) {
		const layout = KEYBOARD_LAYOUTS[layoutName as keyof typeof KEYBOARD_LAYOUTS];
		if (!layout) continue;
		
		const matchCount = chars.filter(char => char in layout).length;
		// If most characters match this layout, use it
		if (matchCount >= chars.length * 0.5) {
			return layoutName as keyof typeof KEYBOARD_LAYOUTS;
		}
	}
	
	// If no priority layout matched, check all layouts
	const matches: Record<string, number> = {};
	
	Object.entries(KEYBOARD_LAYOUTS).forEach(([layoutName, layout]) => {
		const matchCount = chars.filter(char => char in layout).length;
		if (matchCount > 0) {
			matches[layoutName] = matchCount;
		}
	});
	
	// Return layout with most matches
	if (Object.keys(matches).length === 0) return null;
	
	const bestMatch = Object.entries(matches).reduce((a, b) => a[1] > b[1] ? a : b);
	return bestMatch[0] as keyof typeof KEYBOARD_LAYOUTS;
};

/**
 * Converts text from any keyboard layout to English QWERTY based on key positions
 * Auto-detects the source layout
 * @param text - Input text to convert
 * @returns Converted text in English layout
 */
export const convertToEnglishLayout = (text: string): string => {
	if (!text) return '';
	
	const detectedLayout = detectLayout(text);
	if (!detectedLayout) return text;
	
	return convertWithLayout(text, KEYBOARD_LAYOUTS[detectedLayout]);
};

/**
 * Converts text to English layout or returns original if already in English
 * @param text - Input text
 * @returns Converted string (not an array)
 */
export const convertLayoutToEnglish = (text: string): string => {
	if (!text) return '';
	return convertToEnglishLayout(text).toLowerCase();
};

/**
 * Returns both original text and converted variant
 * Useful for search functionality to match against multiple variants
 * @param text - Input text
 * @returns Array of text variants (original + converted)
 */
export const getSearchVariants = (text: string): string[] => {
	if (!text) return [];
	
	const textLower = text.toLowerCase();
	const variants = new Set<string>([textLower]);
	
	// Auto-detect layout and convert
	const converted = convertToEnglishLayout(text);
	if (converted && converted.toLowerCase() !== textLower) {
		variants.add(converted.toLowerCase());
	}
	
	return Array.from(variants);
};

/**
 * Checks if search query matches target string, considering keyboard layout variations
 * @param searchQuery - User's search input
 * @param targetString - String to search in
 * @returns true if any variant matches
 */
export const matchesWithLayoutConversion = (searchQuery: string, targetString: string): boolean => {
	if (!searchQuery || !targetString) return false;
	
	const searchVariants = getSearchVariants(searchQuery);
	const targetLower = targetString.toLowerCase();
	
	return searchVariants.some(variant => targetLower.includes(variant));
};