/* preferences.ts
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
'use strict';
const { Adw, GObject, Gtk } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Gettext = imports.gettext;
const Domain = Gettext.domain(Me.metadata.uuid);
const _ = Domain.gettext;
// const ngettext = Domain.ngettext;
// eslint-disable-next-line no-var
export var Preferences = GObject.registerClass({
    GTypeName: 'Preferences',
    Template: Me.dir.get_child('ui').get_child('preferences.ui').get_uri(),
    InternalChildren: ['font', 'launcherBox', 'launcherPosition'],
}, class Preferences extends Adw.PreferencesPage {
    constructor(window, properties = {}) {
        super(properties);
        this._settings = ExtensionUtils.getSettings();
        this._font.set_font(this._settings.get_string('font'));
        this._launcherBox.set_value(['left', 'center', 'right'].indexOf(this._settings.get_string('launcher-box')));
        this._launcherPosition.set_value([0, -1].indexOf(this._settings.get_enum('launcher-position')));
        /*
                  this._launcherBox.set_format_value_func(([], value) => {
                      return ([_("left"), _("center"), _("right")]).at(value);
                  });
                  this._launcherPosition.set_format_value_func(([], value) => {
                      return ([_("first"), _("last")]).at(value);
                  });
        */
        this._launcherBox.set_format_value_func(() => {
            return _('icon');
        });
        this._launcherPosition.set_format_value_func(() => {
            return _('icon');
        });
        window.connect('close-request', () => {
            this._launcherBox.set_format_value_func(null);
            this._launcherPosition.set_format_value_func(null);
        });
        [_('left'), _('center'), _('right')].forEach((label, index) => {
            this._launcherBox.add_mark(index, Gtk.PositionType.BOTTOM, label);
        });
        [_('first'), _('last')].forEach((label, index) => {
            this._launcherPosition.add_mark(index, Gtk.PositionType.BOTTOM, label);
        });
    }
    _onFontSet() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
        this._settings.set_string('font', this._font.get_font_family()?.get_name());
    }
    _onLauncherBoxChange() {
        this._settings.set_string('launcher-box', 
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ['left', 'center', 'right'].at(this._launcherBox.get_value()));
    }
    _onLauncherPositionChange() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this._settings.set_enum('launcher-position', [0, -1].at(this._launcherPosition.get_value()));
    }
});
