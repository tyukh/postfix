/* application.ts
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * SPDX-FileCopyrightText: 2022 Roman Tyukh
 *
 */

'use strict';

import type * as GIO from '@gi-types/gio2';
import type * as INTERFACE from './interface';

const {GObject} = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const Interface = Me.imports.calculator.interface;

// eslint-disable-next-line no-var
export var Calculator = GObject.registerClass(
  {
    Properties: {
      uuid: GObject.ParamSpec.string(
        'uuid',
        'uuid',
        'A read-write string property',
        GObject.ParamFlags.READWRITE,
        ''
      ),
    },
  },
  class Calculator extends GObject.Object implements GJS.IExtension {
    private readonly _settings: GIO.Settings;

    private _uuid!: string | null;
    private _font: string;
    private _launcherBox: string;
    private _launcherPosition: number;

    private _interface!: INTERFACE.IInterface | null;

    constructor(properties = {}) {
      super(properties);

      ExtensionUtils.initTranslations();

      this._settings = ExtensionUtils.getSettings();

      this._settings.connect('changed::font', this._onExtensionSettingsChanged.bind(this));
      this._settings.connect('changed::launcher-box', this._onExtensionSettingsChanged.bind(this));
      this._settings.connect(
        'changed::launcher-position',
        this._onExtensionSettingsChanged.bind(this)
      );

      this._font = this._settings.get_string('font');
      this._launcherBox = this._settings.get_string('launcher-box');
      this._launcherPosition = this._settings.get_enum('launcher-position');
    }

    public get uuid(): string | null {
      if (this._uuid === undefined) this._uuid = null;
      return this._uuid;
    }

    public set uuid(value: string | null) {
      if (this._uuid !== value) this._uuid = value;
    }

    public enable(): void {
      this._interface = new Interface.Interface({
        font: this._font,
      });
      /* In here we are adding the button in the status area
       * - button is and instance of panelMenu.Button
       * - 0 is the position
       * - `right` is the box where we want our button to be displayed (left/center/right)
       */
      Main.panel.addToStatusArea(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this._uuid!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this._interface.launcher!,
        this._launcherPosition,
        this._launcherBox
      );
    }

    public disable(): void {
      this._interface?.destroy();
      this._interface = null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _onExtensionSettingsChanged(_source: this, _key: string): void {
      this._font = this._settings.get_string('font');
      this._launcherBox = this._settings.get_string('launcher-box');
      this._launcherPosition = this._settings.get_enum('launcher-position');

      this.disable();
      this.enable();
    }
  }
);
