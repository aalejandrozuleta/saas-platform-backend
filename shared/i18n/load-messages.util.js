"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMessagesFromDirectory = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const JSON_EXTENSION = '.json';
const loadMessagesFromDirectory = (basePath) => {
    const locales = (0, node_fs_1.readdirSync)(basePath, {
        withFileTypes: true,
    }).filter((entry) => entry.isDirectory());
    return locales.reduce((messages, locale) => {
        messages[locale.name] = loadLocaleMessages((0, node_path_1.join)(basePath, locale.name));
        return messages;
    }, {});
};
exports.loadMessagesFromDirectory = loadMessagesFromDirectory;
const loadLocaleMessages = (localePath) => {
    const entries = (0, node_fs_1.readdirSync)(localePath, {
        withFileTypes: true,
    });
    return entries.reduce((messages, entry) => {
        const fullPath = (0, node_path_1.join)(localePath, entry.name);
        if (entry.isDirectory()) {
            return {
                ...messages,
                ...loadLocaleMessages(fullPath),
            };
        }
        if (entry.isFile() && entry.name.endsWith(JSON_EXTENSION)) {
            return {
                ...messages,
                ...JSON.parse((0, node_fs_1.readFileSync)(fullPath, 'utf-8')),
            };
        }
        return messages;
    }, {});
};
