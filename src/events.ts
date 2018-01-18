import * as mitt from "mitt";

/** All possible events that Checkout emits. */
export enum CheckoutEvent {
  /** A payment has been authorized. */
  Authorize = "authorize",

  /**
   * The Checkout session has been canceled.
   * Checkout requests for its modal to be closed.
   *
   * To avoid a redirect, reply immediately with the
   * `AcknowledgeCloseRequest` action.
   */
  Cancel = "cancel",

  /**
   * The Checkout session has been completed.
   * Checkout requests for its modal to be closed.
   *
   * To avoid a redirect, reply immediately with the
   * `AcknowledgeCloseRequest` action.
   */
  Close = "close",

  /** A payment type has been selected. */
  PaymentTypeSelection = "paymentTypeSelection",

  /** The payment card type has been determined. */
  CardTypeResolve = "cardTypeResolve"
}

export default CheckoutEvent;

/** The emitter factory function. Creates a new emitter. */
// tslint:disable-next-line:naming-convention
export const createEmitter: EmitterFactory = (mitt as any).default;

// tslint:disable:completed-docs
export type EmitterFactory = (
  eventHandlerMap?: Partial<EventHandlerMap>
) => Emitter;

export interface Emitter {
  on: OnOff;
  off: OnOff;
  emit: Emit;
}

export type SingleEventHandler = (event?: any) => void;
export type AllEventsHandler = (type: CheckoutEvent, event?: any) => void;
export type EventHandler = SingleEventHandler | AllEventsHandler;

export type OnOffSingle = (
  type: CheckoutEvent,
  handler: SingleEventHandler
) => void;

export type OnOffAll = (type: "*", handler: AllEventsHandler) => void;

export type OnOff = OnOffSingle & OnOffAll;

export type Emit = (type: CheckoutEvent, event?: any) => void;

export type SingleEventHandlerMap = {
  [key in CheckoutEvent]: Array<SingleEventHandler>
};

export interface AllEventsHandlerMap {
  "*": Array<AllEventsHandler>;
}

export type EventHandlerMap = SingleEventHandlerMap & AllEventsHandlerMap;
