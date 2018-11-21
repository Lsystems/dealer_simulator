// require RndmSeed

class Bourse {
  constructor(game) {
    this.game = game

    this.main = new BourseLine({
      seed: this.game.current.bourseSeed,
    })

    this.bonus = 0

    // stoque les bourses des villes
    this.cities = {}
  }

  onEvent(){
    this.game.obs.sub('timer:sliceTime', this.onNewTimeSlice.bind(this))
    this.game.obs.sub('bourse:bonus', bonus => this.bonus += bonus)
  }

  onNewTimeSlice() {
    // TODO: fillit
  }

  /**
   * add a subbourse
   * @param {string} city the city name or id
   */

  addCity(city) {

    // add listener
    this.game.obs.sub(`bourse:${city}.bonus`,
      bonus => this.cities[city]._bonus += bonus
    )
    
    // create the city
    return this.cities[city] = {
      bourse: this.main.subBourse({power: 5})
      ,_bonus: 0
      ,get bonus() {
        return this.bonus + this.cities[city]._bonus
      }
      ,products: {}
      ,addProduct(product) {
        let currentCity = this.cities[city]
        // ajout du listener pour la modification du bonus
        this.game.obs.sub(`bourse:${city}:${product}.bonus`,
          bonus => currentCity.products[product]._bonus += bonus
        )

        // create the product
        return currentCity.products[product] = {
          bourse: currentCity.bourse.subBourse({power: 5})
          ,_bonus: 0
          ,get bonus() {
            return currentCity.bonus + currentCity.products[product]._bonus
          }
          ,get fluctuation() {
            let currentProduct = currentCity.products[product]
            let index = this.game.current.timeSlice
            // retourne la valeur en pourcentage de la bourse actuelle
            return Math.max(currentProduct.bourse.get(index) + currentProduct.bonus, 0)
          }
          ,get line() {
            let currentProduct = currentCity.products[product]
            let index = this.game.current.timeSlice
            // retourne la liste de valeurs de la bourse du produit
            return currentProduct.bourse.getLineUntil(index)
          }
        }
      }
    }
  }

  getFluctuation(city, product) {
    return this.cities[city].products[product].fluctuation
  }
}

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
    let newValue = base + this._getDelta(index)
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