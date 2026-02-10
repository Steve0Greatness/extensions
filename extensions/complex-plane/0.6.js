/**
 * @author Steve0Greatness <steve0greatnessiscool@gmail.com>
 * @license LGPL-v3-only
 * @version 0.6
 */
(function(Scratch){

const self_id = "s0gcomplexplane";

class Complex {
  customId = self_id + "_number";
  /**
   * @private
   */
  _real = 0;
  /**
   * @private
   */
  _imaginary = 0;

  get RE() {
    return this._real;
  }

  get IM() {
    return this._imaginary;
  }

  constructor(RE, IM) {
    this._real = RE ?? 0;
    this._imaginary = IM ?? 0;
  }

  /**
   * Outputs a new complex number from either a complex
   * value or real value.
   * @returns {Complex}
   */
  static complexify(val) {
    if (val instanceof Complex) return val;
    if (is_real_number(val)) return new Complex(Scratch.Cast.toNumber(val), 0);
    return new Complex(0, 0);
  }

  /**
   * All real?
   * @returns {Boolean}
   */
  get all_real() {
    return this.IM === 0;
  }

  /**
   * All imaginary?
   * @returns {Boolean}
   */
  get all_imaginary() {
    return this.IM !== 0 && this.RE === 0;
  }

  /**
   * Returns if the number is fully equal to 0.
   * @returns {Boolean}
   */
  get is_zero() {
    return this.abs == 0;
  }

  /**
   * Returns if the number is NaN.
   *
   * @returns {Boolean}
   */
  get is_nan() {
    return this.abs == NaN;
  }

  /**
   * Divides the current complex number by the complex number w.
   * @param {Complex} w
   * @returns {Complex}
   */
  div(w) {
    let divisor = w.abs * w.abs;

    return new Complex(
      (this.RE * w.RE + this.IM * w.IM) / divisor,
      (this.IM * w.RE - this.RE * w.IM) / divisor
    );
  }

  /**
   * Multiplies w and the current complex number.
   * @param {Complex} w
   * @returns {Complex}
   */
  mul(w) {
    return new Complex((this.RE * w.RE - this.IM * w.IM), (this.IM * w.RE + this.RE * w.IM));
  }

  /**
   * Adds current complex with secondary complex w
   * @param {Complex} w
   * @returns {Complex}
   */
  add(w) {
    return new Complex(this.RE + w.RE, this.IM + w.IM);
  }

  /**
   * Inverse of addition function.
   * @param {Complex} w
   * @returns {Complex}
   */
  sub(w) {
    return new Complex(this.RE - w.RE, this.IM - w.IM);
  }

  /**
   * Power function using exp and ln
   *
   * @param {Complex} w
   * @returns {Complex}
   */
  pow(w) {
    if (this.is_zero && !w.all_imaginary) return Complex.complexify(Number(w.is_zero));
    return this.ln.mul(w).exp;
  }

  /**
   * Complex exponential function.
   * 
   * @returns {Complex}
   */
  get exp() {
    const mag  = Math.exp(this.RE)
    const real = mag * Math.cos(this.IM);
    const imag = mag * Math.sin(this.IM);
    return new Complex(real, imag);
  }

  /**
   * Complex radical function with complex values
   * @param {Complex} w
   * @returns {Complex}
   */
  root(w) {
    const pow = Complex.complexify(1).div(w);
    return this.pow(pow);
  }

  /**
   * Complex logarithm with complex values.
   * @returns {Complex}
   */
  log_with_base(w) {
    return this.ln.div(w.ln);
  }

  /**
   * Complex natural logarithm.
   * @param {Complex} w
   * @returns {Complex}
   */
  get ln() {
    return new Complex(Math.log(this.abs), this.arg)
  }

  /**
   * The absolute value of the complex number.
   *
   * @returns {number}
   */
  get abs() {
    return Math.hypot(this.RE, this.IM);
  }

  /**
   * "Argument" (angle) of the complex number.
   *
   * The real number is treated as an x and imaginary
   * as a y.
   *
   * @returns {number}
   */
  get arg() {
    return Math.atan2(this.IM, this.RE);
  }

  /**
   * Complex number flipped across the imaginary
   * axis.
   * @returns {Complex}
   */
  get conj() {
    return new Complex(this.RE, -this.IM);
  }

  /**
   * Performs a comparison between the current complex number
   * and a secondary complex number
   *
   * @param {Complex} w
   * @returns {Complex}
   */
  compare(w) {
    return this.RE == w.RE && this.IM == w.IM;
  }

  /**
   * @priv
   * @returns {string}
   */
  get __operation__() {
    return this.IM >= 0 ? "+" : "-";
  }

  /**
   * @returns {string}
   */
  toString() {
    return this.RE.toString() + this.__operation__ + this.IM.toString() + "i";
  }

  /**
   * returns {HTMLElement}
   */
  toReporterContent() {
    const display = document.createElement("span");

    const imaginary_unit = document.createElement("em");
    imaginary_unit.innerText = "i";

    if (this.RE != 0)
      display.append(scientific(this.RE))
    if ((this.RE != 0 && this.IM != 0) || this.IM < 0)
      display.append(this.__operation__)
    if (this.IM != 0)
      display.append(scientific(Math.abs(this.IM)), imaginary_unit);

    if (this.IM == 0 && this.RE == 0) display.append("0");

    return display;
  }

  /**
  * Works exactly like toString().
  * @returns {string}
  */
  valueOf() {
    return this.toString();
  }
}

function is_real_number(val) {
  return typeof val === "number" || typeof val === "string";
}

/**
 * returns {HTMLElement|string}
 */
function scientific(num) {
  const full = num.toString().split("e");
  if (full.length == 1) return full[0];
  
  const sci_holder = document.createElement("span");
  const exponent = document.createElement("sup");
  exponent.innerText = full[1];

  sci_holder.append("(" + parseFloat(full[0]).toFixed(5) + " \u00D7 10", exponent, ")");
  return sci_holder;
}

class ComplexPlane {
  runtime = Scratch.vm.runtime;
  getInfo() {
    return {
      id: self_id,
      name: "Complex Plane",
      color1: "#4cce5e",
      blocks: [
        {
          opcode: "complex_define",
          text: "[RE] + [IM]\u{1D456}",
          blockType: Scratch.BlockType.REPORTER,
          arguments: {
            RE: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
            },
            IM: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
            }
          }
        },
        "---",
        {
          opcode: "re",
          text: "\u{211C}\u{1D522} [COMP_A]",
          blockType: Scratch.BlockType.REPORTER,
          arguments: {
            COMP_A: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
            },
          }
        },
        {
          opcode: "all_re",
          text: "is [COMP_A] all real?",
          blockType: Scratch.BlockType.BOOLEAN,
          arguments: {
            COMP_A: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
            },
          }
        },
        {
          opcode: "im",
          text: "\u{2111}\u{1D52A} [COMP_A]",
          blockType: Scratch.BlockType.REPORTER,
          arguments: {
            COMP_A: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
            },
          }
        },
        {
          opcode: "all_im",
          text: "is [COMP_A] all imaginary?",
          blockType: Scratch.BlockType.BOOLEAN,
          arguments: {
            COMP_A: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
            },
          }
        },
        "---",
        {
          opcode: "add",
          text: "[COMP_A] + [COMP_B]",
          blockType: Scratch.BlockType.REPORTER,
          arguments: {
            COMP_A: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
              defaultValue: -3,
            },
            COMP_B: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
              defaultValue: 4,
            }
          }
        },
        {
          opcode: "sub",
          text: "[COMP_A] - [COMP_B]",
          blockType: Scratch.BlockType.REPORTER,
          arguments: {
            COMP_A: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
              defaultValue: 1,
            },
            COMP_B: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
              defaultValue: 4,
            }
          }
        },
        {
          opcode: "mul",
          text: "[COMP_A] * [COMP_B]",
          blockType: Scratch.BlockType.REPORTER,
          arguments: {
            COMP_A: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
              defaultValue: 5,
            },
            COMP_B: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
              defaultValue: 2,
            }
          }
        },
        {
          opcode: "div",
          text: "[COMP_A] / [COMP_B]",
          blockType: Scratch.BlockType.REPORTER,
          arguments: {
            COMP_A: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
              defaultValue: 10,
            },
            COMP_B: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
              defaultValue: 5,
            }
          }
        },
        {
          opcode: "root",
          text: "[COMP_B] \u{221A} [COMP_A]",
          blockType: Scratch.BlockType.REPORTER,
          arguments: {
            COMP_B: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
              defaultValue: 4,
            },
            COMP_A: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
              defaultValue: 16,
            }
          }
        },
        {
          opcode: "pow",
          text: "[COMP_A] ^ [COMP_B]",
          blockType: Scratch.BlockType.REPORTER,
          arguments: {
            COMP_A: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
              defaultValue: 2,
            },
            COMP_B: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
              defaultValue: 4,
            }
          }
        },
        {
          opcode: "log",
          text: "log base [COMP_B] of [COMP_A]",
          blockType: Scratch.BlockType.REPORTER,
          arguments: {
            COMP_B: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
              defaultValue: 2,
            },
            COMP_A: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
              defaultValue: 16,
            },
          }
        },

        {
          opcode: "funcs",
          text: "[FUNC] of [COMP]",
          blockType: Scratch.BlockType.REPORTER,
          arguments: {
            FUNC: {
              type: Scratch.ArgumentType.TEXT,
              menu: "FUNCS"
            },
            COMP: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
            },
          }
        },
        "---",
        {
          opcode: "comp",
          text: "[COMP_A] = [COMP_B]",
          blockType: Scratch.BlockType.BOOLEAN,
          arguments: {
            COMP_A: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
            },
            COMP_B: {
              type: Scratch.ArgumentType.NUMBER,
              exemptFromNormalization: true,
            }
          }
        },
        "---",
        {
          opcode: "pi",
          text: "\u{1D7B9}",
          blockType: Scratch.BlockType.REPORTER
        },
        {
          opcode: "e",
          blockType: Scratch.BlockType.REPORTER
        },
      ],
      menus: {
        FUNCS: {
          acceptReporters: true,
          items: [
            "abs",
            "arg",
            {
              text: "conjugate",
              value: "conj"
            },
            {
              text: "e^",
              value: "exp"
            },
            "ln",
            {
              text: "sine",
              value: "sin"
            },
            {
              text: "cosine",
              value: "cos"
            },
          ]
        }
      }
    }
  }

  complex_define({RE, IM}) {
    return this.add({COMP_A: RE, COMP_B: Complex.complexify(IM).mul(new Complex(0, 1))});
  }

  add({COMP_A, COMP_B}) {
    return Complex.complexify(COMP_A).add(Complex.complexify(COMP_B));
  }
  sub({COMP_A, COMP_B}) {
    return Complex.complexify(COMP_A).sub(Complex.complexify(COMP_B));
  }
  mul({COMP_A, COMP_B}) {
    return Complex.complexify(COMP_A).mul(Complex.complexify(COMP_B));
  }
  div({COMP_A, COMP_B}) {
    return Complex.complexify(COMP_A).div(Complex.complexify(COMP_B));
  }

  pow({COMP_A, COMP_B}) {
    return Complex.complexify(COMP_A).pow(Complex.complexify(COMP_B));
  }
  root({COMP_A, COMP_B}) {
    return Complex.complexify(COMP_A).root(Complex.complexify(COMP_B));
  }
  log({COMP_A, COMP_B}) {
    return Complex.complexify(COMP_A).log_with_base(Complex.complexify(COMP_B));
  }

  re({COMP_A}) {
    return Complex.complexify(COMP_A).RE;
  }
  im({COMP_A}) {
    return Complex.complexify(COMP_A).IM;
  }

  all_re({COMP_A}) {
    return Complex.complexify(COMP_A).all_real;
  }
  all_im({COMP_A}) {
    return Complex.complexify(COMP_A).all_imaginary;
  }

  comp({COMP_A, COMP_B}) {
    return Complex.complexify(COMP_A).compare(Complex.complexify(COMP_B));
  }

  funcs({COMP, FUNC}) {
    switch (FUNC) {
    case "abs":
      return Complex.complexify(COMP).abs;
    case "arg":
      return Complex.complexify(COMP).arg;
    case "conj":
      return Complex.complexify(COMP).conj;
    case "exp":
      return Complex.complexify(COMP).exp;
    case "ln":
      return Complex.complexify(COMP).ln;
    case "sin":
    case "cos":
      const comp_exp = Complex.complexify(COMP)
          .mul(new Complex(0, 1)).exp;
      const conj_exp = Complex.complexify(COMP)
          .mul(new Complex(0, -1)).exp;

      switch (FUNC) {
      case "sin":
          return comp_exp.sub(conj_exp)
            .div(new Complex(0, 2));
      case "cos":
          return comp_exp.add(conj_exp)
            .div(new Complex(2, 0));
      }
    }
  }

  pi() {
    return Math.PI;
  }

  e() {
    return Math.E;
  }
}

Scratch.extensions.register(new ComplexPlane());

})(Scratch);
