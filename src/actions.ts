/** All possible actions that Checkout responds to. */
export enum Action {
  /** Load a Checkout session. */
  LoadSession = "loadSession",

  /**
   * Handshake with the iframe document and establish
   * a channel for communication.
   */
  InitiateHandshake = "initiateHandshake",

  /**
   * Is sent as a response to the `Close` and `Cancel` events.
   * Acknowledges a request from Checkout to close the modal and
   * prevents Checkout from redirecting.
   */
  AcknowledgeCloseRequest = "acknowledgeCloseRequest"
}

export default Action;
