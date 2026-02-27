/**
 * @author Steve0Greatness <steve0greatnessiscool@gmail.com>
 * @license LGPL-v3-only
 * @version 0.7
 */
(function(Scratch){

const self_id = "s0gcomplexplane";

var lanczos_precision_modifier = 5;
var lanczos_coefficient_count_ = 5;
  
let Chebyshev = new Map([
  ["1,1", 1], ["2,2", 1],
]);

function find_value(x, y) {
  // C[1,1] = 1
  // C[2,2] = 1
  // C[n+1,1] = -C[n-1,1]
  // C[n+1,n+1] = 2C[n,n]
  // C[n+1][m+1] = 2C[n,m]-C[n-1,m+1]
  const record_value = val => {
    Chebyshev.set(x+","+y, val);
    return val;
  }
  if (Chebyshev.has(x+","+y)) return Chebyshev.get(x+","+y);
  if (y == 1) return record_value(-find_value(x-2,1));
  if (x == y) return record_value(2 * find_value(x-1,x-1));
  if (x > y > 0) return record_value(2 * find_value(x-1,y-1) - find_value(x-2,y))
  throw "Couldn't find value with recursive formula";
};

function double_factorial(n) {
  let product = 1;
  for (let i = 0; i <= Math.ceil(n/2)-1; i++)
    product *= n - 2 * i;
  return n;
}

const SQRT2_over_PI = Math.sqrt(2)/Math.PI;

function calculate_coefficients() {
  let coefficients = [];

  for (let i = 0; i < lanczos_coefficient_count_; i++) {
    var coefficient = 0;
    for (let l = 0; l <= i; l++) {
      const Chebyshev_coefficient = find_value(2*i+1, 2*l+1);
      const F = (
          double_factorial(2*l-1)
          * Math.exp(l + lanczos_precision_modifier + 0.5)
        )
        / (
          Math.pow(2, l)
          * Math.pow(l + lanczos_precision_modifier + 0.5, l + 0.5)
        );
      coefficient += Chebyshev_coefficient * F;
    }

    coefficients.push(coefficient * SQRT2_over_PI);
  }

  return coefficients;
}

const lanczos_coefficients = calculate_coefficients();

class Complex {
  static Precomputed = new Map([
    ["ZERO", new Complex(0)],
    ["HALF", new Complex(0.5)],
    ["EULER_CONST", new Complex(0.5772156649015329)],
    ["LOG2", new Complex(Math.log(2))],
    ["SQRT2PI", new Complex(Math.sqrt(2*Math.PI))],
    ["ONE", new Complex(1)],
    ["NEGATIVE", new Complex(-1)],
    ["SQRT2_OVER_PI", new Complex(Math.SQRT2/Math.PI)],
    ["TWO", new Complex(2)],
    ["I", new Complex(0,1)],
  ]);

  /**
   * RegExp used for the `fromString` method to make sure the number is valid.
   * @returns {RegExp}
   */
  static get REGEXP() {
    return /^(\-?[\d]*(?:\.[\d]+)?(?:e\d+)?)\+(\-?[\d]*(?:\.[\d]+)?(?:e\d+)?)i$/;
  }

  static get ZERO() {
    return Complex.Precomputed.get("ZERO");
  }

  static get HALF() {
    return Complex.Precomputed.get("HALF");
  }

  static get ONE() {
    return Complex.Precomputed.get("ONE");
  }

  static get I() {
    return Complex.Precomputed.get("I");
  }

  static get TWO() {
    return Complex.Precomputed.get("TWO");
  }

  static get EULER_CONST() {
    return Complex.Precomputed.get("EULER_CONST");
  }

  static get LOG2() {
    return Complex.Precomputed.get("LOG2");
  }

  static get NEGATIVE() {
    return Complex.Precomputed.get("NEGATIVE");
  }

  static get SQRT2PI() {
    return Complex.Precomputed.get("SQRT2PI");
  }

  static get PRECISION_MODIFIER_PRIME() {
    return new Complex(lanczos_precision_modifier+0.5);
  }

  static get SQRT2_OVER_PI() {
    return Complex.Precomputed.get("SQRT2_OVER_PI");
  }

  #real = 0;
  #imaginary = 0;

  get RE() {
    return this.real;
  }

  get IM() {
    return this.imaginary;
  }

  constructor(RE, IM) {
    this.real = RE ?? 0;
    this.imaginary = IM ?? 0;
    if (Scratch.extensions.isPenguinMod)
      this.customId = self_id + "_number";
  }

  /**
   * Outputs a new complex number from either a complex
   * value or real value.
   * @returns {Complex}
   */
  static complexify(val) {
    if (val instanceof Complex) return val;
    if (is_real_number(val)) return new Complex(Scratch.Cast.toNumber(val));
    if (typeof val == "string") return Complex.fromString(val);
    return Complex.ZERO;
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
    return isNaN(this.abs);
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
    return new Complex(
      (this.RE * w.RE - this.IM * w.IM),
      (this.IM * w.RE + this.RE * w.IM)
    );
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
   * Complex sine in radians
   * @returns {Complex}
   */
  get sin() {
    return new Complex(
      Math.sin(this.RE) * Math.cosh(this.IM),
      Math.cos(this.RE) * Math.sinh(this.IM)
    );
  }
  /**
   * Complex cosine in radians
   * @returns {Complex}
   */
  get cos() {
    return new Complex(
      Math.cos(this.RE) * Math.cosh(this.IM),
      -Math.sin(this.RE) * Math.sinh(this.IM)
    );
  }
  /**
   * Complex tangent function in radians
   * @returns {Complex}
   */
  get tan() {
    return this.sin.div(this.cos);
  }

  /**
   * Complex inverse sine
   */
  get arcsin() {
    const hypot = Complex.ONE
      .sub(this.pow(Complex.TWO))
      .pow(Complex.HALF);
      
    return hypot.sub(Complex.I.mul(this)).ln.mul(Complex.I);
  }

  /**
   * Complex inverse cosine
   */
  get arccos() {
    const hypot = Complex.ONE
      .sub(this.pow(Complex.TWO))
      .pow(Complex.HALF);
      
    return this.sub(Complex.I.mul(hypot)).ln.mul(Complex.I);
  }

  /**
   * Complex inverse tangent
   */
  get arctan() {
    return new Complex(0, -0.5)
      .mul(
        this
          .add(Complex.I)
          .div(this.sub(I))
          .ln
      );
  }



  /**
   * Determines the value of $\ln\Gamma(z)$ then raised $e$ to it.
   *
   * TODO Reimplement using another, faster converging, series. Likely Lanczos
   * approximation.
   * @returns {Complex}
   */
  get gamma() {
    let sum = Complex.ZERO;
    for (let index = 1; index < 10000000; index++) {
      const prime = this.div(new Complex(index));
      sum = sum.add(
        prime.sub(Complex.ONE.add(prime).ln)
      );
    }
    return Complex.EULER_CONST
      .mul(Complex.NEGATIVE)
      .mul(this)
      .sub(this.ln)
      .add(sum)
      .exp;
  }

  static get LANCZOS_COEFFICIENTS() {
    return lanczos_coefficients;
  }

  get gamma2() {
    const z = this.sub(1);

    const z_prime = this.add(Complex.PRECISION_MODIFIER_PRIME);
    
    const nonsummation = Complex.SQRT2PI
      .mul(
        z_prime.pow(z.add(Complex.HALF))
      )
      .mul(
        z_prime.mul(Complex.NEGATIVE).exp
      );

    // TODO implement the A function. I'll need to figure out a way of
    // calculating the coefficients.
    
    var sum = Complex.LANCZOS_COEFFICIENTS[0];
    for (let i = 1; i < lanczos_coefficient_count_; i++) {
      
    }

    return sum.mul(nonsummation);
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
    return this.RE.toString() + this.__operation__ + Math.abs(this.IM).toString() + "i";
  }

  /**
   * Attempts to parse a complex number as a string.
   * TODO this function is fairly primitive at current moment. Might be a good
   *      idea to redo it at some point.
   * @returns {Complex}
   */
  static fromString(str) {
    const parts = Complex.REGEXP.exec(str);
    if (!parts) return Complex.ZERO;
    return new Complex(parseFloat(parts[0]), parseFloat(parts[1]));
  }

  /**
   * returns {HTMLElement}
   */
  toReporterContent() {
    const display = document.createElement("span");

    if (this.is_zero) {
      display.append("0");
      return display;
    }

    if (this.is_nan) {
      display.append("NaN");
      return display;
    }

    const imaginary_unit = document.createElement("span");
    imaginary_unit.innerText = "\u{1D456}";

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
  return typeof val === "number";
}

/**
 * Puts a given number into scientific notation when JavaScript
 * would've put an "e" into the number.
 *
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
  type = Complex;
  constructor() {
    if (this.runtime.registerSerializer)
      this.runtime?.registerSerializer(
        self_id + "_number",
        complex => ({
          "RE": complex.RE,
          "IM": complex.IM,
        }),
        complex => new Complex(complex.RE, complex.IM)
      );
  }
  getInfo() {
    return {
      id: self_id,
      name: "Complex Plane",
      color1: "#4cce5e",
      blocks: [
        {
          blockType: Scratch.BlockType.LABEL,
          text: `Usage warning: This extension is experimental`
        },
        {
          blockType: Scratch.BlockType.LABEL,
          text: `and is subject to change. Do not use this in`
        },
        {
          blockType: Scratch.BlockType.LABEL,
          text: `production projects.`
        },
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
        {
          opcode: "i",
          text: "\u{1D456}",
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
            {
              text: "\u{211C}\u{1D522}",
              value: "real",
            },
            {
              text: "\u{2111}\u{1D52A}",
              value: "imag"
            },
            {
              text: "\u{1D6AA}",
              value: "gamma"
            }
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

  comp({COMP_A, COMP_B}) {
    return Complex.complexify(COMP_A).compare(Complex.complexify(COMP_B));
  }

  funcs({COMP, FUNC}) {
    var Z = Complex.complexify(COMP);
    switch (FUNC) {
    case "real":
      return Z.RE;
    case "imag":
      return Z.IM;
    default:
      return Z[FUNC];
    }
  }

  pi() {
    return Math.PI;
  }

  e() {
    return Math.E;
  }

  i() {
    return new Complex(0, 1);
  }
}

Scratch.extensions.register(new ComplexPlane());

})(Scratch);
