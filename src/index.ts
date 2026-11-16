import joplin from 'api';
import {ContentScriptType, SettingItemType} from "../api/types";

export const SETTING_TRIGGER_CHARACTER = 'settingTriggerCharacter';
export const SETTING_SHOW_NON_EXACT_MATCHES = 'settingShowNonExactMatches';

joplin.plugins.register({
    onStart: async function () {

        const section = 'markdownEmojiAutocompleteSection';
        const contentScriptId = 'de-pernpas-joplin-markdown-emoji-autocomplete';

        await joplin.settings.registerSection(section, {
            label: 'Markdown Emoji Autocomplete',
            iconName: 'fas fa-smile'
        });

        await joplin.settings.registerSettings({
            [SETTING_TRIGGER_CHARACTER]: {
                value: ':',
                type: SettingItemType.String,
                section: section,
                public: true,
                label: 'Enable Emoji Autocomplete on Character',
                description: 'Specifies the character that triggers emoji autocomplete. Note: The pop-up appears after typing the first character, so using a frequently used character like ":" may disrupt regular typing.',
            },
            [SETTING_SHOW_NON_EXACT_MATCHES]: {
                value: true,
                type: SettingItemType.Bool,
                section: section,
                public: true,
                label: 'Show non-exact matches',
                description: 'If disabled, only emojis whose name contains the typed text are suggested (e.g. ":car" will not suggest ":camera:"). Requires restarting Joplin.',
            },
        });

        await joplin.contentScripts.register(
            ContentScriptType.CodeMirrorPlugin,
            contentScriptId,
            './markdownEmojiAutocompleteScript.js', // JS file is built from src/contentScript.ts
        );

        // Handle messages from the content script
        await joplin.contentScripts.onMessage(contentScriptId, async (message: string) => {
            if (message === 'getTriggerCharacter') {
                return await joplin.settings.value(SETTING_TRIGGER_CHARACTER) ?? ':';
            }
            if (message === 'getShowNonExactMatches') {
                return await joplin.settings.value(SETTING_SHOW_NON_EXACT_MATCHES) ?? true;
            }
        });
    },
});