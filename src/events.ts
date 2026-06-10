import mitt from 'mitt'

/** All possible events that Checkout emits. */
export enum CheckoutEvent {
  /** A payment has been authorized. */
  Authorize = 'authorize',

  /**
   * The Checkout session has been canceled.
   * Checkout requests for its modal to be closed.
   *
   * To avoid a redirect, reply immediately with the
   * `AcknowledgeCloseRequest` action.
   */
  Cancel = 'cancel',

  /**
   * The Checkout session has been completed.
   * Checkout requests for its modal to be closed.
   *
   * To avoid a redirect, reply immediately with the
   * `AcknowledgeCloseRequest` action.
   */
  Close = 'close',

  /** A payment type has been selected. */
  PaymentTypeSelection = 'paymentTypeSelection',

  /** The payment card type has been determined. */
  CardTypeResolve = 'cardTypeResolve',
}

/** The emitter factory function. Creates a new emitter. */
export const createEmitter: EmitterFactory = (eventHandlerMap) => {
  const emitter = mitt() as unknown as Emitter

  if (!eventHandlerMap) {
    return emitter
  }

  for (const type in eventHandlerMap) {
    if (!Object.prototype.hasOwnProperty.call(eventHandlerMap, type)) {
      continue
    }

    const handlers = eventHandlerMap[type as CheckoutEvent | '*'] as EventHandler[]

    for (const handler of handlers) {
      emitter.on(type as '*', handler as AllEventsHandler)
    }
  }

  return emitter
}

export type EmitterFactory = (eventHandlerMap?: Partial<EventHandlerMap>) => Emitter

export interface Emitter {
  on: OnOff
  off: OnOff
  emit: Emit
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- backward compatibility for legacy event payload typing
export type SingleEventHandler = (event?: unknown | any) => void
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- backward compatibility for legacy event payload typing
export type AllEventsHandler = (type: CheckoutEvent, event?: unknown | any) => void
export type EventHandler = SingleEventHandler | AllEventsHandler

export type OnOffSingle = (type: CheckoutEvent, handler: SingleEventHandler) => void

export type OnOffAll = (type: '*', handler: AllEventsHandler) => void

export type OnOff = OnOffSingle & OnOffAll

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- backward compatibility for legacy event payload typing
export type Emit = (type: CheckoutEvent, event?: unknown | any) => void

export type SingleEventHandlerMap = {
  [key in CheckoutEvent]: Array<SingleEventHandler>
}

export interface AllEventsHandlerMap {
  '*': Array<AllEventsHandler>
}

export type EventHandlerMap = SingleEventHandlerMap & AllEventsHandlerMap
