import { CheckoutEvent } from '../../src/events'

export function eventHelper(event: CheckoutEvent = CheckoutEvent.Authorize, payload?: unknown): string {
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
