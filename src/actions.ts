/** All possible actions that Checkout responds to. */
export enum Action {
  /** Load a Checkout session. */
  LoadSession = 'loadSession',

  /**
   * Handshake with the iframe document and establish
   * a channel for communication.
   */
  InitiateHandshake = 'initiateHandshake',
}
