/**
 * Immutable Object.
 */

export default class TicketTypeRequest {
  #type

  #noOfTickets

  constructor(type, noOfTickets) {
    if (!this.#Type.includes(type)) {
      throw new TypeError(
        `type must be ${this.#Type
          .slice(0, -1)
          .join(', ')}, or ${this.#Type.slice(-1)}`,
      )
    }

    if (!Number.isInteger(noOfTickets)) {
      throw new TypeError('noOfTickets must be an integer')
    }

    if (noOfTickets < 0) {
      throw new TypeError('noOfTickets must be positive')
    }

    this.#type = type
    this.#noOfTickets = noOfTickets
    Object.freeze(this)
  }

  getNoOfTickets() {
    return this.#noOfTickets
  }

  getTicketType() {
    return this.#type
  }

  getTicketsPrice() {
    switch (this.#type) {
      case 'ADULT':
        return 20.0 * this.#noOfTickets

      case 'CHILD':
        return 10.0 * this.#noOfTickets

      case 'INFANT':
        return 0
    }
  }

  #Type = ['ADULT', 'CHILD', 'INFANT']
}
