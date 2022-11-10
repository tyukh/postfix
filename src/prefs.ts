/* prefs.ts
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * SPDX-FileCopyrightText: 2022 Roman Tyukh
 *
 */

'use strict';

import type * as ADW from '@gi-types/adw1';

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Preferences = Me.imports.preferences.preferences;

export function init(): void {
  ExtensionUtils.initTranslations();
}

export function fillPreferencesWindow(window: ADW.PreferencesWindow): void {
  window.add(new Preferences.Preferences(window));
}
