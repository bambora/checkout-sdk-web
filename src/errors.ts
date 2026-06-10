// Polyfill for setPrototypeOf
const setPrototypeOf =
  Object.setPrototypeOf ||
  ((obj: { __proto__?: object | null }, proto: object | null) => {
    obj.__proto__ = proto
    return obj as object
  })

type ErrorConstructorWithStackTrace = ErrorConstructor & {
  captureStackTrace?: (targetObject: object) => void
}

const errorWithStackTrace = Error as ErrorConstructorWithStackTrace

/** Thrown when a session token is required but has not been provided. */
export class NoSessionTokenProvidedError extends ReferenceError {
  constructor(message?: string) {
    super(message)
    setPrototypeOf(this, new.target.prototype)
    if (errorWithStackTrace.captureStackTrace) {
      errorWithStackTrace.captureStackTrace(this)
    }
  }
}

/** Thrown when there was a problem loading a session. */
export class LoadSessionError extends Error {
  constructor(message?: string) {
    super(message)
    setPrototypeOf(this, new.target.prototype)
    if (errorWithStackTrace.captureStackTrace) {
      errorWithStackTrace.captureStackTrace(this)
    }
  }
}

/** Thrown when the response to a message has resulted in an error. */
export class GenericMessageError extends Error {
  constructor(message?: string) {
    super(message)
    setPrototypeOf(this, new.target.prototype)
    if (errorWithStackTrace.captureStackTrace) {
      errorWithStackTrace.captureStackTrace(this)
    }
  }
}

/** Thrown when handshaking could not be completed. */
export class HandshakeError extends Error {
  constructor(message?: string) {
    super(message)
    setPrototypeOf(this, new.target.prototype)
    if (errorWithStackTrace.captureStackTrace) {
      errorWithStackTrace.captureStackTrace(this)
    }
  }
}

/** Thrown when a container is required but has not been provided. */
export class ContainerNotSpecifiedError extends Error {
  constructor(message?: string) {
    super(message)
    setPrototypeOf(this, new.target.prototype)
    if (errorWithStackTrace.captureStackTrace) {
      errorWithStackTrace.captureStackTrace(this)
    }
  }
}
