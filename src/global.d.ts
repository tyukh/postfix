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
  import type * as CLUTTER from '@gi-types/clutter10';
  import type * as GIO from '@gi-types/gio2';
  import type * as ST from '@gi-types/st1';

  namespace EXTENSION {
    declare class ExtensionUtils {
      initTranslations: (domain?: string) => void;
      getSettings: (schema?: string) => GIO.Settings;
      openPrefs: () => void;
      getCurrentExtension: () => ExtensionDescriptor;
    }

    declare class ExtensionMetadata {
      uuid: string;
      name: string;
    }

    declare class ExtensionDescriptor {
      metadata: ExtensionMetadata;
      uuid: string;
      dir: GIO.File;
      path: string;
      imports: ExtensionImports;
    }

    declare class ExtensionImports {
      calculator: {
        calculator: typeof import('./calculator/calculator');
        interface: typeof import('./calculator/interface');
        processor: typeof import('./calculator/processor');
      };
      preferences: {
        preferences: typeof import('./preferences/preferences');
      };
    }
  }

  declare class Gi {
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

  declare class Misc {
    extensionUtils: EXTENSION.ExtensionUtils;
  }

  declare namespace Main {
    declare const panel: Panel.Panel;
    declare function notify(msg: string, details: string): void;
  }

  declare namespace Panel {
    declare class Panel {
      addToStatusArea: (
        role: string,
        indicator: PanelMenu.Button,
        position: number,
        box: string
      ) => PanelMenu.Button;
    }
  }

  declare namespace PanelMenu {
    declare class Button {
      constructor(menuAlignment: number, nameText: string, dontCreateMenu?: boolean);
      add_child(child: CLUTTER.Actor): void;
      destroy(): void;
      menu: PopupMenu.PopupMenu;
    }
  }

  declare namespace PopupMenu {
    declare class PopupMenuBase {
      connectObject(
        ...args: object[{
          signalName: string;
          handler: (actor: CLUTTER.Actor, event: CLUTTER.Event) => boolean;
        }]
      ): void;
      addMenuItem(menuItem: PopupBaseMenuItem, position?: number): void;
      toggle(): void;
      box: ST.BoxLayout;
    }

    declare class PopupMenu extends PopupMenuBase {
      actor: PopupMenuBase;
    }

    declare class PopupSubMenu extends PopupMenuBase {}

    declare const Ornament = {
      NONE: 0,
      DOT: 1,
      CHECK: 2,
      HIDDEN: 3,
    } as const;

    declare class PopupBaseMenuItem extends ST.BoxLayout {
      setOrnament(ornament: typeof Ornament[keyof typeof Ornament]): void;
    }

    declare class PopupSubMenuMenuItem extends PopupBaseMenuItem {
      constructor(text: string, wantIcon: boolean);
      menu: PopupSubMenu;
    }

    declare class PopupSeparatorMenuItem extends PopupBaseMenuItem {
      constructor(text?: string);
    }
  }

  declare class Ui {
    main: typeof Main;
    panelMenu: typeof PanelMenu;
    popupMenu: typeof PopupMenu;
  }

  declare class Gettext {
    gettext: (msgid: string) => string;
    ngettext: (msgid1: string, msgid2: string, n: number) => string;
    domain: (domainName: string) => {
      gettext: (msgid: string) => string;
      ngettext: (msgid1: string, msgid2: string, n: number) => string;
    };
  }

  declare class Imports {
    gi: Gi;
    misc: Misc;
    ui: Ui;
    gettext: Gettext;
  }

  interface IExtension {
    enable(): void;
    disable(): void;
  }
}

declare const imports: GJS.Imports;
