// tslint:disable:max-classes-per-file
// tslint:disable:early-exit

// Ponyfill for setPrototypeOf
const setPrototypeOf =
  Object.setPrototypeOf ||
  ((obj: any, proto: any) => {
    obj.__proto__ = proto;
    return obj;
  });

/** Thrown when a session token is required but has not been provided. */
export class NoSessionTokenProvidedError extends ReferenceError {
  constructor(message?: string) {
    super(message);
    setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NoSessionTokenProvidedError);
    }
  }
}

/** Thrown when there was a problem loading a session. */
export class LoadSessionError extends Error {
  constructor(message?: string) {
    super(message);
    setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LoadSessionError);
    }
  }
}

/** Thrown when the response to a message has resulted in an error. */
export class GenericMessageError extends Error {
  constructor(message?: string) {
    super(message);
    setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GenericMessageError);
    }
  }
}

/** Thrown when handshaking could not be completed. */
export class HandshakeError extends Error {
  constructor(message?: string) {
    super(message);
    setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HandshakeError);
    }
  }
}

/** Thrown when a container is required but has not been provided. */
export class ContainerNotSpecifiedError extends Error {
  constructor(message?: string) {
    super(message);
    setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ContainerNotSpecifiedError);
    }
  }
}
