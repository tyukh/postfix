'use strict';

declare function log(msg: string): void;
declare function print(msg: string): void;
declare function logError(error: Error, msg?: string): void;
declare function printerr(msg: string): void;

declare namespace Gjs {
  declare interface ExtensionUtils {
    initTranslations: (domain?: string) => void;
    getSettings: (schema?: string) => Gio.Settings;
    openPrefs: () => void;
    getCurrentExtension: () => GjsExtension;
  }

  declare interface ExtensionMetadata {
    uuid: string;
    name: string;
    'settings-schema'?: string;
    'gettext-domain'?: string;
  }

  declare interface Extension {
    metadata: GjsExtensionMetadata;
    uuid: string;
    dir: Gio.File;
    path: string;
  }

  declare interface Gi {
    versions: {
      [key: string]: string;
    };
    Adw: typeof import('@gi-types/adw');
    Clutter: typeof import('@gi-types/clutter');
    Gio: typeof import('@gi-types/gio');
    Glib: typeof import('@gi-types/glib');
    GObject: typeof import('@gi-types/gobject');
    Gtk: typeof import('@gi-types/gtk');
    St: typeof import('@gi-types/st');
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

declare const imports: Gjs.Imports;
