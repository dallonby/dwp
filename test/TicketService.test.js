import SeatReservationService from '../src/thirdparty/seatbooking/SeatReservationService.js'
import TicketPaymentService from '../src/thirdparty/paymentgateway/TicketPaymentService.js'
import TicketService from '../src/pairtest/TicketService.js'
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js'
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js'
import chai from 'chai'
import sinon from 'sinon'

const expect = chai.expect

describe('TicketService', () => {
  const mockMakePayment = sinon.spy(TicketPaymentService.prototype,"makePayment")
  const mockReserveSeat = sinon.spy(SeatReservationService.prototype,"reserveSeat")

  describe('Buy three adult tickets', () => {
    it('Should be £60', () => {
      const ts = new TicketService()
      const accountNumber = 1
      const requests = [new TicketTypeRequest('ADULT', 3)]
      ts.purchaseTickets(accountNumber, ...requests)
      expect(mockMakePayment.calledWith(1,60)).to.be.true
      expect(mockReserveSeat.calledWith(1,3)).to.be.true
    })
  })

  describe('Buy one adult tickets and two children tickets', () => {
    it('Should be £40', () => {
      const ts = new TicketService()
      const accountNumber = 1
      const requests = [
        new TicketTypeRequest('ADULT', 1),
        new TicketTypeRequest('CHILD', 2),
      ]
      ts.purchaseTickets(accountNumber, ...requests)
      expect(mockMakePayment.calledWith(1,40)).to.be.true
      expect(mockReserveSeat.calledWith(1,3)).to.be.true
    })
  })

  describe('Buy two adult tickets and two infant tickets', () => {
    it('Should be £40 with 2 seats reserved', () => {
      const ts = new TicketService()
      const accountNumber = 1
      const requests = [
        new TicketTypeRequest('ADULT', 2),
        new TicketTypeRequest('INFANT', 2),
      ]
      ts.purchaseTickets(accountNumber, ...requests)
      expect(mockMakePayment.calledWith(1,40)).to.be.true
      expect(mockReserveSeat.calledWith(1,2)).to.be.true
    })
  })

  //fail cases
  describe('Buy one adult tickets and two infant tickets', () => {
    const expectedError =
      'All Infants will require their own Adult upon whom to sit'
    it(`Should fail with "${expectedError}"`, () => {
      const ts = new TicketService()
      const accountNumber = 1
      const requests = [
        new TicketTypeRequest('ADULT', 1),
        new TicketTypeRequest('INFANT', 2),
      ]
      try {
        ts.purchaseTickets(accountNumber, ...requests)
      } catch (error) {
        expect(error).to.be.instanceOf(InvalidPurchaseException)
        expect(error.message).to.equal(expectedError)
        return
      }
      expect.fail(null, null, 'purchaseTickets did not reject this purchase')
    })
  })

  describe('Buy two child tickets and two infant tickets', () => {
    const expectedError = 'Children and Infants require at least one Adult'
    it(`Should fail with "${expectedError}"`, () => {
      const ts = new TicketService()
      const accountNumber = 1
      const requests = [
        new TicketTypeRequest('CHILD', 2),
        new TicketTypeRequest('INFANT', 2),
      ]
      try {
        ts.purchaseTickets(accountNumber, ...requests)
      } catch (error) {
        expect(error).to.be.instanceOf(InvalidPurchaseException)
        expect(error.message).to.equal(expectedError)
        return
      }
      expect.fail(null, null, 'purchaseTickets did not reject this purchase')
    })
  })

  describe('Buy twenty two adult tickets', () => {
    const expectedError = 'Maximum of 20 tickets per order'
    it(`Should fail with "${expectedError}"`, () => {
      const ts = new TicketService()
      const accountNumber = 1
      const requests = [new TicketTypeRequest('ADULT', 22)]
      try {
        ts.purchaseTickets(accountNumber, ...requests)
      } catch (error) {
        expect(error).to.be.instanceOf(InvalidPurchaseException)
        expect(error.message).to.equal(expectedError)
        return
      }
      expect.fail(null, null, 'purchaseTickets did not reject this purchase')
    })
  })

  describe('Buy eighteen adults and four child tickets', () => {
    const expectedError = 'Maximum of 20 tickets per order'
    it(`Should fail with "${expectedError}"`, () => {
      const ts = new TicketService()
      const accountNumber = 1
      const requests = [
        new TicketTypeRequest('ADULT', 18),
        new TicketTypeRequest('CHILD', 4)
      ]
      try {
        ts.purchaseTickets(accountNumber, ...requests)
      } catch (error) {
        expect(error).to.be.instanceOf(InvalidPurchaseException)
        expect(error.message).to.equal(expectedError)
        return
      }
      expect.fail(null, null, 'purchaseTickets did not reject this purchase')
    })
  })

  describe('Buy two adult tickets using account number 0', () => {
    const expectedError = 'accountId must be a positive integer'
    it(`Should fail with "${expectedError}"`, () => {
      const ts = new TicketService()
      const requests = [new TicketTypeRequest('ADULT', 2)]
      try {
        ts.purchaseTickets(0, ...requests)
      } catch (error) {
        expect(error).to.be.instanceOf(InvalidPurchaseException)
        expect(error.message).to.equal(expectedError)
        return
      }
      expect.fail(null, null, 'purchaseTickets did not reject this purchase')
    })
  })

  describe('Buy two adult tickets using account "ONE"', () => {
    const expectedError = 'accountId must be a positive integer'
    it(`Should fail with "${expectedError}"`, () => {
      const ts = new TicketService()
      const requests = [new TicketTypeRequest('ADULT', 2)]
      try {
        ts.purchaseTickets('ONE', ...requests)
      } catch (error) {
        expect(error).to.be.instanceOf(InvalidPurchaseException)
        expect(error.message).to.equal(expectedError)
        return
      }
      expect.fail(null, null, 'purchaseTickets did not reject this purchase')
    })
  })

  describe('Buy minus one adult tickets', () => {
    const expectedError = 'accountId must be a positive integer'
    it(`Should fail with "${expectedError}"`, () => {
      const ts = new TicketService()
      const requests = [new TicketTypeRequest('ADULT', 2)]
      try {
        ts.purchaseTickets(-1, ...requests)
      } catch (error) {
        expect(error).to.be.instanceOf(InvalidPurchaseException)
        expect(error.message).to.equal(expectedError)
        return
      }
      expect.fail(null, null, 'purchaseTickets did not reject this purchase')
    })
  })

  describe('Buy with empty TicketTypeRequests array', () => {
    const expectedError =
      'purchaseTickets must include at least one ticketTypeRequest'
    it(`Should fail with "${expectedError}"`, () => {
      const ts = new TicketService()
      const accountNumber = 1
      const requests = []
      try {
        ts.purchaseTickets(accountNumber, ...requests)
      } catch (error) {
        expect(error).to.be.instanceOf(InvalidPurchaseException)
        expect(error.message).to.equal(expectedError)
        return
      }
      expect.fail(null, null, 'purchaseTickets did not reject this purchase')
    })
  })

  describe('Check reserveSeat is called with accountId=1 and totalSeatsToAllocate=5', () => {
    it(`should be true`, () => {
      const ts = new TicketService()
      const requests = [
        new TicketTypeRequest('ADULT', 2),
        new TicketTypeRequest('CHILD', 3),
        new TicketTypeRequest('INFANT', 2),
      ]
      ts.purchaseTickets(1,...requests)
      expect(mockReserveSeat.calledWith(1,5)).to.be.true
    })
  })

  describe('Check makePayment is called with accountId=1 and totalAmountToPay=100', () => {
    it(`should be true`, () => {
      const ts = new TicketService()
      const requests = [new TicketTypeRequest('ADULT', 5)]
      ts.purchaseTickets(1,...requests)
      expect(mockMakePayment.calledWith(1,100)).to.be.true
    })
  })

})
