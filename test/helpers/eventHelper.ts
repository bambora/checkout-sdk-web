import { CheckoutEvent } from '../../src/events'

export function eventHelper(event: CheckoutEvent = CheckoutEvent.Authorize, payload?: any): string {
  return `
    window.parent.postMessage(
      {
        handshakeId: payload,
        event: "${event}",
        payload: ${JSON.stringify(payload)}
      },
      "*"
    );
  `
}

export default eventHelper
