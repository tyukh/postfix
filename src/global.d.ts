/* global.d.ts
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * SPDX-FileCopyrightText: 2022 Roman Tyukh
 *
 */

'use strict';

declare function log(msg: string): void;
declare function logError(error: Error, msg?: string): void;

declare namespace GJS {
  import type * as GIO from '@gi-types/gio2';

  declare interface ExtensionUtils {
    initTranslations: (domain?: string) => void;
    getSettings: (schema?: string) => GIO.Settings;
    openPrefs: () => void;
    getCurrentExtension: () => Extension;
  }

  declare interface ExtensionMetadata {
    uuid: string;
    name: string;
  }

  declare interface ExtensionImports {
    application: {
      application: typeof import('./application/application');
      interface: typeof import('./application/interface');
      processor: typeof import('./application/processor');
    };
    preferences: {
      preferences: typeof import('./preferences/preferences');
    };
  }

  declare interface Extension {
    metadata: ExtensionMetadata;
    uuid: string;
    dir: GIO.File;
    path: string;
    imports: ExtensionImports;
  }

  declare interface Gi {
    versions: {
      [key: string]: string;
    };
    Adw: typeof import('@gi-types/adw1');
    Clutter: typeof import('@gi-types/clutter10');
    Gio: typeof import('@gi-types/gio2');
    Glib: typeof import('@gi-types/glib2');
    GObject: typeof import('@gi-types/gobject2');
    Gtk: typeof import('@gi-types/gtk4');
    St: typeof import('@gi-types/st1');
  }

  declare interface Misc {
    extensionUtils: ExtensionUtils;
  }

  declare interface Ui {
    main: any;
    panelMenu: any;
    popupMenu: any;
  }

  declare interface Gettext {
    gettext: (msgid: string) => string;
    ngettext: (msgid1: string, msgid2: string, n: number) => string;
    domain: (domainName: string) => {
      gettext: (msgid: string) => string;
      ngettext: (msgid1: string, msgid2: string, n: number) => string;
    };
  }

  declare interface Imports {
    gi: Gi;
    misc: Misc;
    ui: Ui;
    gettext: Gettext;
  }
}

declare const imports: GJS.Imports;
