// require sha256(string)

/**
 * Create a new pseudo random generator
 */
class RndmSeed {
  /**
   * @param {string} seed the seed used to generate randoms
   */
  constructor(seed) {
    this.seed = seed
    this.index = 0
  }
  /**
   * Create a new RndmSeed based on this seed
   * @param {string} seed the sub-seed used to generate randoms
   * @return {RndmSeed}
   */
  subSeed(seed) {
    return this.constuctor(this.seed + seed)
  }
  /**
   * Get the current random or the one referneced by the index
   * @param {int?} index Facultativ reference for a random
   * @return {number}
   */
  get(index = this.index) {
    return +`0.${this._value(this.seed + '_' + index)}`
  }
  /**
   * Generate the next random
   * @return {number}
   */
  next() {
    return this.get(++this.index)
  }
  _value(str) {
    return String(parseInt(this._sha(str), 16)).slice(1)
  }
  _sha(str) {
    return sha256(str).slice(0, 16)
  }
}

/**
 * Test the generated randoms to know if the seed is revelant
 * @param {string?} seed the seed to test
 * @param {int?} total number of random to generate
 * @param {int?} precision can be 10, 100, 1000, ... (10^n|n>0)
 */
const testRndmSeed = (seed = 'test', total = 10000, precision = 10) => {
  const r = new RndmSeed(seed)
  const s = Array(total)
    .fill(0)
    .reduce(a => {
      const ref = Math.floor(r.next() * precision)
      if (a[ref]) a[ref]++
      else a[ref] = 1
      return a
    }, {})
  const expected = 100 / precision
  const avg = Object.entries(s)
    .map(([key, value]) => ([key, expected - value * 100 / total]))
    .reduce((a, [k, v]) => {
      v = Math.abs(v)
      if (a.min > v) a.min = v
      if (a.max < v) a.max = v
      a.avg += v
      a.avg_i++
      if (a.avg_i === precision) {
        a.avg /= precision
        delete a.avg_i
      }
      return a
    }, {
      min: Infinity,
      max: 0,
      avg: 0,
      avg_i: 0
    });

  console.log(s, avg)
}