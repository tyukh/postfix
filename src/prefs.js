/* prefs.ts
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
'use strict';
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Preferences = Me.imports.preferences.preferences;
export function init() {
    ExtensionUtils.initTranslations();
}
export function fillPreferencesWindow(window) {
    window.add(new Preferences.Preferences(window));
}
