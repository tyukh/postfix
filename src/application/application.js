/* application.ts
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
'use strict';
const { GObject } = imports.gi;
// const Gettext = imports.gettext;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
// const Domain = Gettext.domain(Me.metadata.uuid);
// const _ = Domain.gettext;
// const ngettext = Domain.ngettext;
const Main = imports.ui.main;
const Interface = Me.imports.application.interface;
export var Application = GObject.registerClass({
    Properties: {
        uuid: GObject.ParamSpec.string('uuid', 'uuid', 'A read-write string property', GObject.ParamFlags.READWRITE, ''),
    },
}, class Application extends GObject.Object {
    constructor(properties = {}) {
        super(properties);
        ExtensionUtils.initTranslations();
        this._settings = ExtensionUtils.getSettings();
        this._settings.connect('changed::font', this._onExtensionSettingsChanged.bind(this));
        this._settings.connect('changed::launcher-box', this._onExtensionSettingsChanged.bind(this));
        this._settings.connect('changed::launcher-position', this._onExtensionSettingsChanged.bind(this));
        this._font = this._settings.get_string('font');
        this._launcherBox = this._settings.get_string('launcher-box');
        this._launcherPosition = this._settings.get_enum('launcher-position');
    }
    get uuid() {
        if (this._uuid === undefined)
            this._uuid = null;
        return this._uuid;
    }
    set uuid(value) {
        if (this._uuid !== value)
            this._uuid = value;
    }
    enable() {
        this._calculator = new Interface.Calculator({
            font: this._font,
        });
        /* In here we are adding the button in the status area
         * - button is and instance of panelMenu.Button
         * - 0 is the position
         * - `right` is the box where we want our button to be displayed (left/center/right)
         */
        Main.panel.addToStatusArea(this._uuid, this._calculator.launcher, this._launcherPosition, this._launcherBox);
    }
    disable() {
        this._calculator.destroy();
        this._calculator = null;
    }
    _onExtensionSettingsChanged(source, key) {
        this._font = this._settings.get_string('font');
        this._launcherBox = this._settings.get_string('launcher-box');
        this._launcherPosition = this._settings.get_enum('launcher-position');
        this.disable();
        this.enable();
    }
});
