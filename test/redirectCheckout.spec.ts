import { expect } from 'chai'
import { assert, stub } from 'sinon'

import { NoSessionTokenProvidedError } from '../src/errors'
import RedirectCheckout from '../src/redirectCheckout'

describe('RedirectCheckout', () => {
  describe('#constructor()', () => {
    it('redirects when a session token is provided', () => {
      const redirect = stub(RedirectCheckout.prototype, '_redirect' as any)

      new RedirectCheckout('123456')

      assert.calledWith(
        redirect,
        'https://v1.checkout.bambora.com/123456?ui=fullscreen&language=en-US#eyJ2ZXJzaW9uIjoiTlBNX1ZFUlNJT04ifQ==',
      )

      redirect.restore()
    })

    it('does not redirect when the session token is not provided', () => {
      const redirect = stub(RedirectCheckout.prototype, '_redirect' as any)

      new RedirectCheckout(null)

      assert.notCalled(redirect)
      redirect.restore()
    })
  })

  describe('#initialize()', () => {
    it('provides a redirect URL in a Promise result when the session token is provided', async () => {
      // Calling initialize should perform the redirect:
      const checkout = new RedirectCheckout(null)

      expect(await checkout.initialize('123456')).to.equal(
        'https://v1.checkout.bambora.com/123456?ui=fullscreen&language=en-US#eyJ2ZXJzaW9uIjoiTlBNX1ZFUlNJT04ifQ==',
      )

      // Calling initialize without ever providing a session token should throw a NoSessionTokenProvidedError:
      const checkout2 = new RedirectCheckout(null)

      try {
        await checkout2.initialize()
        throw new Error('An error should be thrown')
      } catch (error) {
        expect(error).to.be.instanceof(NoSessionTokenProvidedError)
      }
    })
  })
})
