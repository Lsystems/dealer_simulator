// require RndmSeed

class BourseLine {
  /**
   * Create a new bourse
   * @param {{seed:string, initial: number, power: number}} param0 seed for random; for initial value; power of changes
   */
  constructor({
    seed,
    initial = 100,
    power = 10
  }) {
    this.power = power
    this.initial = initial
    this._line = []
    this._delta = new RndmSeed(seed)
  }
  /**
   * Get full line of values until this index
   * @param {integer} index 
   */
  getLineUntil(index) {
    this._generateLineTo(index)
    return this._line.slice(0, index + 1)
  }
  /**
   * Get value at this index
   * @param {integer} index 
   */
  get(index) {
    this._generateLineTo(index)
    return this._line[index]
  }
  /**
   * get a new bourse based on this one
   * @param {*} options same as constructor
   */
  subBourse(options) {
    return new BourseSubLine(this, options)
  }
  _generateLineTo(index) {
    while (index >= this._line.length)
      this._line.push(this._calculate())
  }
  _calculate(index = this._line.length) {
    const base = this._getBase(index)
    let newValue = base + delta
    // Evite d'avoir une valeur en dessous de 0
    for (let delta = this._getDelta(index); newValue < 0; delta /= 2)
      newValue = base + delta
    return newValue
  }
  _getBase(index) {
    return index === 0 ? this.initial : this._line[index - 1]
  }
  _getDelta(index) {
    return (this._delta.get(index) - 0.5) * 2 * this.power
  }
}

class BourseSubLine extends BourseLine {
  constructor(bourse, options) {
    super(options)
    this.bourse = bourse
  }

  _getBase(index) {
    const equiv = this.initial / this.bourse.initial
    return this.bourse.get(index) * equiv
  }
}