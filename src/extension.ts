/* extension.ts
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * SPDX-FileCopyrightText: 2022 Roman Tyukh
 *
 */

'use strict';

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Calculator = Me.imports.calculator.calculator;

export function init(meta: typeof Me.metadata): GJS.IExtension {
  return new Calculator.Calculator({uuid: meta.uuid});
}
