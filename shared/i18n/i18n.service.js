"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18nService = void 0;
class I18nService {
    constructor(messages, defaultLang = 'es') {
        this.messages = messages;
        this.defaultLang = defaultLang;
        this.normalizedDefaultLang = this.normalizeLang(defaultLang);
    }
    resolveLanguage(lang) {
        const requested = this.normalizeLang(lang);
        if (this.messages[requested]) {
            return requested;
        }
        const baseLang = requested.split('-')[0];
        if (this.messages[baseLang]) {
            return baseLang;
        }
        if (this.messages[this.normalizedDefaultLang]) {
            return this.normalizedDefaultLang;
        }
        return this.defaultLang;
    }
    translate(key, lang, params) {
        const resolvedLang = this.resolveLanguage(lang);
        const defaultBaseLang = this.normalizedDefaultLang.split('-')[0];
        const template = this.messages[resolvedLang]?.[key] ??
            this.messages[resolvedLang.split('-')[0]]?.[key] ??
            this.messages[this.normalizedDefaultLang]?.[key] ??
            this.messages[defaultBaseLang]?.[key] ??
            key;
        return this.interpolate(template, params);
    }
    normalizeLang(lang) {
        if (!lang) {
            return this.defaultLang;
        }
        return lang.split(',')[0].trim().toLowerCase();
    }
    interpolate(template, params) {
        if (!params) {
            return template;
        }
        return template.replaceAll(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key) => {
            const value = params[key];
            return value === undefined || value === null
                ? `{{${key}}}`
                : this.formatValue(value);
        });
    }
    formatValue(value) {
        if (typeof value === 'string') {
            return value;
        }
        if (typeof value === 'number' ||
            typeof value === 'boolean' ||
            typeof value === 'bigint') {
            return String(value);
        }
        if (value instanceof Date) {
            return value.toISOString();
        }
        return JSON.stringify(value);
    }
}
exports.I18nService = I18nService;
