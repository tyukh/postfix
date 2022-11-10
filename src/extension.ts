/* extension.ts
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

'use strict';

imports.gi.versions.Gtk = '4.0';

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Application = Me.imports.application.application;

export function init(meta: typeof Me.metadata): Application.Application {
  return new Application.Application({uuid: meta.uuid});
}
