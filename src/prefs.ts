/* prefs.ts
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

'use strict';

imports.gi.versions.Gtk = '4.0';

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Preferences = Me.imports.preferences.preferences;

export function init(): void {
  ExtensionUtils.initTranslations();
}

export function fillPreferencesWindow(window: Gtk.Window): void {
  window.add(Preferences.preferences(window));
}
