import InvalidPurchaseException from './lib/InvalidPurchaseException.js'
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js'
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js'

export default class TicketService {
  #totalPrice = 0
  #adultsRequested = 0
  #childrenRequested = 0
  #infantsRequested = 0
  #totalSeatsRequired = 0

  #calculateTicketSales(ticketTypeRequests) {
    for (const request of ticketTypeRequests) {
      const seatsRequired = request.getNoOfTickets()
      this.#totalPrice += request.getTicketsPrice()

      switch (request.getTicketType()) {
        case 'ADULT':
          this.#adultsRequested += seatsRequired
          this.#totalSeatsRequired += request.getNoOfTickets()
          break
        case 'CHILD':
          this.#childrenRequested += seatsRequired
          this.#totalSeatsRequired += request.getNoOfTickets()
          break
        case 'INFANT':
          this.#infantsRequested += seatsRequired
          //infants dont consume a seat and are free
          break
        default:
          throw new InvalidPurchaseException('Unexpected Ticket Type')
      }
    }
  }

  #checkTotalSeat() {
    if (this.#totalSeatsRequired > 20) {
      throw new InvalidPurchaseException('Maximum of 20 tickets per order')
    }
  }

  #checkMinorsWithoutAdult() {
    //children and infants cannot travel without an adult
    if (
      this.#adultsRequested === 0 &&
      this.#childrenRequested + this.#infantsRequested > 0
    ) {
      throw new InvalidPurchaseException(
        'Children and Infants require at least one Adult',
      )
    }
  }

  #checkInfantsGtAdults() {
    //**assumption** every infant requires a unique adult to sit on. Could be uncomfortable otherwise!
    if (this.#adultsRequested > 0 && (this.#infantsRequested > this.#adultsRequested)) {
      throw new InvalidPurchaseException(
        'All Infants will require their own Adult upon whom to sit',
      )
    }
  }

  #checkRequestCount(ticketTypeRequests) {
    if (ticketTypeRequests.length == 0) {
      throw new InvalidPurchaseException(
        'purchaseTickets must include at least one ticketTypeRequest',
      )
    }
  }

  #checkAccountId(accountId) {
    if (!Number.isInteger(accountId) || accountId < 1) {
      throw new InvalidPurchaseException('accountId must be a positive integer')
    }
  }

  /**
   * Should only have private methods other than the one below.
   */
  purchaseTickets(accountId, ...ticketTypeRequests) {

    this.#checkRequestCount(ticketTypeRequests)
    this.#checkAccountId(accountId)
    this.#calculateTicketSales(ticketTypeRequests)
    this.#checkInfantsGtAdults()
    this.#checkMinorsWithoutAdult()
    this.#checkTotalSeat()

    const payment = new TicketPaymentService()
    const seatReservation = new SeatReservationService()
    try {
      payment.makePayment(accountId, this.#totalPrice)
      seatReservation.reserveSeat(accountId, this.#totalSeatsRequired)
    } catch (error) {
      console.log(error.message)
      throw new InvalidPurchaseException(error.message)
    }
  }
}
