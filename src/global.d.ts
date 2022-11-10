'use strict';

declare function log(msg: string): void;
declare function print(msg: string): void;
declare function logError(error: Error, msg?: string): void;
declare function printerr(msg: string): void;

declare interface GjsExtensionUtils {
  initTranslations: (domain?: string) => void;
  getSettings: (schema?: string) => Gio.Settings;
  openPrefs: () => void;
  getCurrentExtension: () => GjsExtension;
}

declare interface GjsExtensionMetadata {
  uuid: string;
  name: string;
  'settings-schema'?: string;
  'gettext-domain'?: string;
}

declare interface GjsExtension {
  metadata: GjsExtensionMetadata;
  uuid: string;
  dir: Gio.File;
  path: string;
}

declare interface GjsGiImports {
  versions: {
    [key: string]: string;
  };
  Adw: typeof import('@gi-types/adw1');
  Clutter: typeof import('@gi-types/clutter');
  Gio: typeof import('@gi-types/gio');
  Glib: typeof import('@gi-types/glib');
  GObject: typeof import('@gi-types/gobject');
  Gtk: typeof import('@gi-types/gtk');
  St: typeof import('@gi-types/st');
}

declare interface GjsMiscImports {
  extensionUtils: GjsExtensionUtils;
}

// declare interface GjsUiImports {
//   main: any;
//   panelMenu: any;
//   popupMenu: any;
// }

declare interface GjsGettextImports {
  gettext: (msgid: string) => string;
  ngettext: (msgid1: string, msgid2: string, n: number) => string;
  domain: (domainName: string) => {
    gettext: (msgid: string) => string;
    ngettext: (msgid1: string, msgid2: string, n: number) => string;
  };
}

declare interface GjsImports {
  gi: GjsGiImports;
  misc: GjsMiscImports;
  // ui: GjsUiImports;
  ui: typeof imports.ui;
  gettext: GjsGettextImports;
}

declare const imports: GjsImports;
