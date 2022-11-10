/* processor.ts
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

'use strict';

// const Main = imports.ui.main;
// Main.notify('Message Title', 'Message Body');

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Decimal = Me.imports.decimal.decimal;

class Value {
  private _mantissaSign: string;
  private _integer: string;
  private _fraction: string;
  private _exponentSign: string;
  private _exponent: string;

  constructor() {
    this.empty();
  }

  public get mantissa(): string {
    const integer = `${this._mantissaSign}${this._integer.length === 0 ? '0' : this._integer}`;
    const fraction = `${this._fraction}`;
    return `${integer}.${fraction}`;
  }

  public get exponent(): string {
    const exponent = `${this._exponentSign}${this._exponent}`;
    return `${exponent}`;
  }

  public set exponent(value: string) {
    const part = value.match(/(?<exponentSign>\+|-)?(?<exponent>\d+)/).groups;
    const defined = (item: string, no: string, yes: () => string): string =>
      item === undefined ? no : yes(item);
    this._exponentSign = defined(part.exponentSign, '', (item) => (item === '-' ? '-' : ''));
    this._exponent = defined(part.exponent, ''.padStart(Processor.Precision.MAX_E, '0'), (item) =>
      item.padStart(Processor.Precision.MAX_E, '0')
    );
  }

  public fromDecimal(value: Decimal.Decimal): Value {
    this.empty();
    const part = value
      .valueOf()
      .match(
        /(?<mantissaSign>\+|-)?(?<integer>\d+)(?:\.)?(?<fraction>\d+)?(?:e|E)?(?<exponentSign>\+|-)?(?<exponent>\d+)?/
      ).groups;
    const defined = (item: string, no: string, yes: () => string): string =>
      item === undefined ? no : yes(item);
    this._mantissaSign = defined(part.mantissaSign, '', (item) => (item === '-' ? '-' : ''));
    this._integer = defined(part.integer, '', (item) => item);
    this._fraction = defined(part.fraction, '', (item) => item);
    this._exponentSign = defined(part.exponentSign, '', (item) => (item === '-' ? '-' : ''));
    this._exponent = defined(part.exponent, '', (item) =>
      item.padStart(Processor.Precision.MAX_E, '0')
    );
    return this;
  }

  public toDecimal(): Decimal.Decimal {
    const integer = `${this._mantissaSign}${this._integer.length === 0 ? '0' : this._integer}`;
    const fraction = `${this._fraction.length !== 0 ? '.' : ''}${this._fraction}`;
    const exponent = `${this._exponent.length !== 0 ? 'e' : ''}${this._exponentSign}${
      this._exponent
    }`;
    return Decimal.Decimal(`${integer}${fraction}${exponent}`);
  }

  public empty(): void {
    this._mantissaSign = '';
    this._integer = '';
    this._fraction = '';
    this._exponentSign = '';
    this._exponent = '';
  }

  public pad(): void {
    this._exponentSign = '';
    this._exponent = ''.padStart(Processor.Precision.MAX_E, '0');
  }

  public defaults(): void {
    this._integer = `1${this._integer.slice(1)}`;
    this._fraction = '';
  }

  public isInteger(): boolean {
    return this._integer.length !== 0;
  }

  public isMantissaFull(): boolean {
    return this._integer.length + this._fraction.length >= Processor.Precision.MAX;
  }

  public integerExtend(value: string): void {
    this._integer += value.toString();
  }

  public fractionExtend(value: string): void {
    this._fraction += value.toString();
  }

  public exponentExtend(value: string): void {
    this._exponent = this._exponent.slice(1) + value.toString();
  }

  public exponentNegate(): void {
    this._exponentSign = this._exponentSign === '-' ? '' : '-';
  }
}

export var Processor = class Processor {
  private _x: Decimal.Decimal;
  private _y: Decimal.Decimal;
  private _z: Decimal.Decimal;
  private _t: Decimal.Decimal;
  private _x1: Decimal.Decimal;
  private _x0: Decimal.Decimal;

  private readonly _number: Value;

  private _actions: Map;

  private _indicatorsCallback: (indicator: number, value: string) => void;

  constructor() {
    Decimal.Decimal.set({
      precision: Processor.Precision.MAX,
      rounding: Decimal.Decimal.ROUND_HALF_UP,
      minE: Processor.Precision.MIN_E_VALUE,
      maxE: Processor.Precision.MAX_E_VALUE,
      toExpPos: Processor.Precision.MAX,
      toExpNeg: -1,
    });

    this._indicatorsCallback = null;

    this._x = new Decimal.Decimal(0);
    this._y = new Decimal.Decimal(0);
    this._z = new Decimal.Decimal(0);
    this._t = new Decimal.Decimal(0);
    this._x1 = new Decimal.Decimal(0); // previous x value
    this._x0 = new Decimal.Decimal(0); // x value before _doOps not _setOps

    this._actionsIs();

    this._number = new Value();
    this._modeIs(Processor.Mode.READY);
  }

  public connectIndicators(callback: (indicator: number, value: string) => void): void {
    this._indicatorsCallback = callback;
    this._output();
  }

  static Precision = {
    MAX: 8,
    MAX_E: 2,
    MIN_E_VALUE: -99,
    MAX_E_VALUE: 99,
  };

  static Key = {
    ZERO: 0,
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
    SIX: 6,
    SEVEN: 7,
    EIGHT: 8,
    NINE: 9,

    POINT: 10,
    SIGN: 11,
    ENTER_E: 12,

    PUSH: 20,
    SWAP: 21,
    CLEAR_X: 22,
    BACK_X: 23,

    PLUS: 30,
    MINUS: 31,
    MULTIPLY: 32,
    DIVIDE: 33,

    CLEAR_F: 81,
    NOP: 82,

    F: 90,
    K: 91,

    RESERVED_NULL: 9999,
  };

  static Indicator = {
    MANTISSA: 0,
    EXPONENT: 1,
    REGISTER_X: 2,
    REGISTER_Y: 3,
    REGISTER_Z: 4,
    REGISTER_T: 5,
    REGISTER_X1: 6,
  };

  static Mode = {
    READY: 0,
    RESULT: 1,
    INTEGER: 2,
    FRACTION: 4,
    EXPONENT: 8,
    F: 16,
    K: 32,
    ERROR: 64,
  };

  private _isMode(mode: number): boolean {
    return (this._mode & mode) !== 0 || this._mode === mode;
  }

  private _modeIs(mode: number): void {
    this._mode = mode;
  }

  private _display(): void {
    this._indicatorsCallback(Processor.Indicator.REGISTER_X, this._x.toString());
    this._indicatorsCallback(Processor.Indicator.REGISTER_Y, this._y.toString());
    this._indicatorsCallback(Processor.Indicator.REGISTER_Z, this._z.toString());
    this._indicatorsCallback(Processor.Indicator.REGISTER_T, this._t.toString());
    this._indicatorsCallback(Processor.Indicator.REGISTER_X1, this._x1.toString());

    if (this._isMode(Processor.Mode.ERROR)) {
      this._indicatorsCallback(Processor.Indicator.MANTISSA, 'ERROR');
      this._indicatorsCallback(Processor.Indicator.EXPONENT, '');
    } else {
      this._indicatorsCallback(Processor.Indicator.MANTISSA, this._number.mantissa);
      this._indicatorsCallback(Processor.Indicator.EXPONENT, this._number.exponent);
    }
  }

  private _input(): void {
    this._x = this._number.toDecimal();
    this._display();
  }

  private _output(): void {
    this._number.fromDecimal(this._x);
    this._display();
  }

  private _setMode(lambda: () => number): void {
    this._modeIs(lambda());
    this._input();
  }

  private _setPoint(): void {
    if (this._isMode(Processor.Mode.EXPONENT)) this._modeIs(Processor.Mode.ERROR);
    else if (this._number.isInteger()) this._modeIs(Processor.Mode.FRACTION);
    this._input();
  }

  private _setDigit(lambda: () => string): void {
    const digit = lambda();
    if (this._isMode(Processor.Mode.EXPONENT)) {
      this._number.exponentExtend(digit);
      const value = new Value().fromDecimal(this._x0);
      const exponent =
        parseInt(this._number.exponent) +
        parseInt(value.exponent.length === 0 ? '0' : value.exponent);
      if (
        exponent > Processor.Precision.MAX_E_VALUE ||
        exponent < Processor.Precision.MIN_E_VALUE
      ) {
        this._modeIs(Processor.Mode.ERROR);
      } else {
        value.exponent = exponent.toString();
        this._x = value.toDecimal();
      }
      this._display();
    } else {
      if (this._isMode(Processor.Mode.RESULT)) this._doPush();
      if (this._isMode(Processor.Mode.READY)) {
        this._number.empty();
        this._modeIs(Processor.Mode.INTEGER);
      }
      if (!this._number.isMantissaFull()) {
        switch (this._mode) {
          case Processor.Mode.INTEGER:
            this._number.integerExtend(digit);
            break;
          case Processor.Mode.FRACTION:
            this._number.fractionExtend(digit);
            break;
        }
      }
      this._input();
    }
  }

  private _setEnterE(): void {
    if (this._x.isZero()) this._number.defaults();

    this._number.pad();
    this._modeIs(Processor.Mode.EXPONENT);
    this._input();
    this._x0 = this._x;
  }

  private _doNegate(): void {
    if (this._isMode(Processor.Mode.EXPONENT)) {
      this._number.exponentNegate();
      this._input();
    } else {
      this._x0 = this._x;
      this._x = this._x.neg();
      this._modeIs(Processor.Mode.READY);
      this._output();
    }
  }

  private _doOp0(lambda: () => number): void {
    this._x0 = this._x;
    this._modeIs(lambda());
    this._output();
  }

  private _doOp2(lambda: () => number): void {
    this._x0 = this._x;
    this._x1 = this._x;
    this._modeIs(lambda());
    if (this._isMode(Processor.Mode.RESULT)) {
      this._y = this._z;
      this._z = this._t;
      // this._t = Decimal.Decimal(0); prototype calculator error?
    }
    this._output();
  }

  private _actionsIs(): void {
    this._actions = new Map([
      // Grey keys
      [
        Processor.Key.ZERO,
        {
          action: this._setDigit.bind(this),
          lambda: () => '0',
        },
      ],
      [
        Processor.Key.ONE,
        {
          action: this._setDigit.bind(this),
          lambda: () => '1',
        },
      ],
      [
        Processor.Key.TWO,
        {
          action: this._setDigit.bind(this),
          lambda: () => '2',
        },
      ],
      [
        Processor.Key.THREE,
        {
          action: this._setDigit.bind(this),
          lambda: () => '3',
        },
      ],
      [
        Processor.Key.FOUR,
        {
          action: this._setDigit.bind(this),
          lambda: () => '4',
        },
      ],
      [
        Processor.Key.FIVE,
        {
          action: this._setDigit.bind(this),
          lambda: () => '5',
        },
      ],
      [
        Processor.Key.SIX,
        {
          action: this._setDigit.bind(this),
          lambda: () => '6',
        },
      ],
      [
        Processor.Key.SEVEN,
        {
          action: this._setDigit.bind(this),
          lambda: () => '7',
        },
      ],
      [
        Processor.Key.EIGHT,
        {
          action: this._setDigit.bind(this),
          lambda: () => '8',
        },
      ],
      [
        Processor.Key.NINE,
        {
          action: this._setDigit.bind(this),
          lambda: () => '9',
        },
      ],
      [
        Processor.Key.POINT,
        {
          action: this._setPoint.bind(this),
          lambda: null,
        },
      ],
      [
        Processor.Key.ENTER_E,
        {
          action: this._setEnterE.bind(this),
          lambda: null,
        },
      ],
      [
        Processor.Key.SIGN,
        {
          action: this._doNegate.bind(this),
          lambda: null,
        },
      ],
      [
        Processor.Key.PUSH,
        {
          action: this._doOp0.bind(this),
          lambda: () => {
            this._t = this._z;
            this._z = this._y;
            this._y = this._x;
            return Processor.Mode.READY;
          },
        },
      ],
      [
        Processor.Key.SWAP,
        {
          action: this._doOp0.bind(this),
          lambda: () => {
            this._x1 = this._x;
            this._x = this._y;
            this._y = this._x1;
            return Processor.Mode.RESULT;
          },
        },
      ],
      [
        Processor.Key.BACK_X,
        {
          action: this._doOp0.bind(this),
          lambda: () => {
            this._t = this._z;
            this._z = this._y;
            this._y = this._x;
            this._x = this._x1;
            return Processor.Mode.RESULT;
          },
        },
      ],
      [
        Processor.Key.PLUS,
        {
          action: this._doOp2.bind(this),
          lambda: () => {
            this._x = this._y.plus(this._x);
            return Processor.Mode.RESULT;
          },
        },
      ],
      [
        Processor.Key.MINUS,
        {
          action: this._doOp2.bind(this),
          lambda: () => {
            this._x = this._y.minus(this._x);
            return Processor.Mode.RESULT;
          },
        },
      ],
      [
        Processor.Key.MULTIPLY,
        {
          action: this._doOp2.bind(this),
          lambda: () => {
            this._x = this._y.times(this._x);
            return Processor.Mode.RESULT;
          },
        },
      ],
      [
        Processor.Key.DIVIDE,
        {
          action: this._doOp2.bind(this),
          lambda: () => {
            if (this._x.isZero()) return Processor.Mode.ERROR;
            this._x = this._y.div(this._x);
            return Processor.Mode.RESULT;
          },
        },
      ],
      // Red keys
      [
        Processor.Key.CLEAR_X,
        {
          action: this._doOp0.bind(this),
          lambda: () => {
            this._x = Decimal.Decimal(0);
            return Processor.Mode.READY;
          },
        },
      ],
      // Yellow keys
      [
        Processor.Key.CLEAR_F,
        {
          action: this._setMode.bind(this),
          lambda: () => Processor.Mode.READY,
        },
      ],
      [
        Processor.Key.F,
        {
          action: this._setMode.bind(this),
          lambda: () => Processor.Mode.F,
        },
      ],
      // Blue keys
      [
        Processor.Key.K,
        {
          action: this._setMode.bind(this),
          lambda: () => Processor.Mode.K,
        },
      ],
      [
        Processor.Key.NOP,
        {
          action: this._setMode.bind(this),
          lambda: () => Processor.Mode.READY,
        },
      ],
    ]);

    this._translateF = new Map([
      [Processor.Key.PUSH, Processor.Key.BACK_X],
      [Processor.Key.CLEAR_X, Processor.Key.CLEAR_F],
    ]);

    this._translateK = new Map([[Processor.Key.ZERO, Processor.Key.NOP]]);
  }

  public keyPressed(key): void {
    if (this._isMode(Processor.Mode.F)) key = this._translateF.get(key);
    if (this._isMode(Processor.Mode.K)) key = this._translateK.get(key);

    if (key === undefined) return;

    const action = this._actions.get(key);
    if (action === undefined) return;
    if (action.lambda === null) action.action();
    else action.action(action.lambda);
  }
}
