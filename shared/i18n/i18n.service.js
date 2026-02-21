"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18nService = void 0;
class I18nService {
    constructor(messages, defaultLang = 'es') {
        this.messages = messages;
        this.defaultLang = defaultLang;
    }
    translate(key, lang) {
        const selectedLang = lang ?? this.defaultLang;
        return (this.messages[selectedLang]?.[key] ??
            this.messages[this.defaultLang]?.[key] ??
            key);
    }
}
exports.I18nService = I18nService;
