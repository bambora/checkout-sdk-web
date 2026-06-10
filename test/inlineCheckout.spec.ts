import { expect } from 'chai'
import { stub } from 'sinon'

import AsyncIframe from '../src/asyncIframe'
import { ContainerNotSpecifiedError, LoadSessionError } from '../src/errors'
import { CheckoutEvent } from '../src/events'
import InlineCheckout from '../src/inlineCheckout'

import { eventHelper, getHtmlBlobUrl, handshakeHelper } from './helpers'

type InlineCheckoutPrototype = {
  _checkoutUrl: string
}

const stubCheckoutUrl = (blobUrl: string) =>
  stub(InlineCheckout.prototype as unknown as InlineCheckoutPrototype, '_checkoutUrl').value(blobUrl)

describe('InlineCheckout', () => {
  describe('#constructor()', () => {
    it('mounts the iframe when container is provided in the constructor', async () => {
      const blobUrl = getHtmlBlobUrl(handshakeHelper())

      const checkoutUrl = stubCheckoutUrl(blobUrl)

      const divElement = document.body.appendChild(document.createElement('div'))

      const checkout = new InlineCheckout('123456', {
        container: divElement,
      })

      const iframe = await checkout.iframe

      expect(iframe.parentElement).to.equal(divElement)
      checkoutUrl.restore()
    })
  })

  describe('#initialize()', () => {
    it('resolves upon successful load of session', async () => {
      const newSessionToken = '654321'
      const postMessage = stub(AsyncIframe.prototype, 'postMessage')
      const blobUrl = getHtmlBlobUrl(handshakeHelper())
      const checkoutUrl = stubCheckoutUrl(blobUrl)

      postMessage.resolves(newSessionToken)

      const checkout = new InlineCheckout('123456', {
        container: document.body,
      })

      expect(await checkout.initialize(newSessionToken)).to.equal(newSessionToken)

      postMessage.restore()
      checkoutUrl.restore()
    })

    it('throws LoadSessionError on failure to load session', async () => {
      const newSessionToken = '654321'
      const postMessage = stub(AsyncIframe.prototype, 'postMessage')
      const blobUrl = getHtmlBlobUrl(handshakeHelper())
      const checkoutUrl = stubCheckoutUrl(blobUrl)

      postMessage.rejects()

      const checkout = new InlineCheckout('123456', {
        container: document.body,
      })

      try {
        await checkout.initialize(newSessionToken)
        throw new Error('An error should be thrown')
      } catch (error) {
        expect(error).to.be.instanceof(LoadSessionError)
      }

      postMessage.restore()
      checkoutUrl.restore()
    })

    it('throws LoadSessionError on attempt to load another session', async () => {
      const newSessionToken = '654321'
      const postMessage = stub(AsyncIframe.prototype, 'postMessage')
      const blobUrl = getHtmlBlobUrl(handshakeHelper())
      const checkoutUrl = stubCheckoutUrl(blobUrl)

      postMessage.resolves(newSessionToken)

      const checkout = new InlineCheckout('123456', {
        container: document.body,
      })

      await checkout.initialize(newSessionToken)

      expect(await checkout.initialize(newSessionToken)).to.equal(newSessionToken)

      try {
        await checkout.initialize('another')
        throw new Error('An error should be thrown')
      } catch (error) {
        expect(error).to.be.instanceof(LoadSessionError)
      }

      postMessage.restore()
      checkoutUrl.restore()
    })
  })

  describe('#mount()', () => {
    it('mounts the iframe to the provided container', async () => {
      const blobUrl = getHtmlBlobUrl(handshakeHelper())
      const checkoutUrl = stubCheckoutUrl(blobUrl)

      const divElement = document.body.appendChild(document.createElement('div'))

      const checkout = new InlineCheckout('123456', {
        container: null,
      })

      await checkout.mount(divElement)

      const iframe = await checkout.iframe

      expect(iframe.parentElement).to.equal(divElement)
      checkoutUrl.restore()
    })
  })

  describe('#iframe', () => {
    it('resolves to a HTMLIFrameElement', async () => {
      const blobUrl = getHtmlBlobUrl(handshakeHelper())
      const checkoutUrl = stubCheckoutUrl(blobUrl)

      const checkout = new InlineCheckout('123456')
      checkout.mount(document.body)

      const iframe = await checkout.iframe

      expect(iframe).to.be.instanceof(HTMLIFrameElement)
      expect(iframe).not.to.be.instanceof(HTMLDivElement)
      expect(iframe.getAttribute('allow')).to.be.eq("payment 'src'")

      checkoutUrl.restore()
    })

    it('throws ContainerNotSpecifiedError when accessing the iframe without having specified a container', async () => {
      const blobUrl = getHtmlBlobUrl(handshakeHelper())
      const checkoutUrl = stubCheckoutUrl(blobUrl)

      const checkout = new InlineCheckout('123456', {
        container: null,
      })

      try {
        await checkout.iframe
        throw new Error('An error should be thrown')
      } catch (error) {
        expect(error).to.be.instanceof(ContainerNotSpecifiedError)
      }

      checkoutUrl.restore()
    })
  })

  describe('#on()', () => {
    it('calls handler upon receiving events', async () => {
      const blobUrl = getHtmlBlobUrl(
        handshakeHelper(true, eventHelper(CheckoutEvent.Authorize, { transactionId: '123' })),
      )

      const checkoutUrl = stubCheckoutUrl(blobUrl)

      const { type, payload } = await new Promise<{
        type: string
        payload: { transactionId: string }
      }>((resolve) => {
        const checkout = new InlineCheckout('123456')
        checkout.mount(document.body)

        if (checkout.on) {
          checkout.on('*', (t, e) => resolve({ type: t, payload: e as { transactionId: string } }))
        }
      })

      expect(type).to.equal(CheckoutEvent.Authorize)
      expect(payload.transactionId).to.equal('123')

      checkoutUrl.restore()
    })
  })

  describe('#destroy()', () => {
    it('removes the iframe element from the DOM', async () => {
      const blobUrl = getHtmlBlobUrl(handshakeHelper())
      const checkoutUrl = stubCheckoutUrl(blobUrl)

      const checkout = new InlineCheckout('123456')
      checkout.mount(document.body)

      const iframe = await checkout.iframe

      expect(document.body.contains(iframe)).to.equal(true)

      checkout.destroy()

      expect(document.body.contains(iframe)).to.equal(false)

      checkoutUrl.restore()
    })
  })
})
