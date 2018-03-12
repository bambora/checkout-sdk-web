import "native-promise-only";
import InlineCheckout from "./inlineCheckout";
import RedirectCheckout from "./redirectCheckout";
import ModalCheckout from "./modalCheckout";
import { UI } from "./options";
import * as Errors from "./errors";
import Event from "./events";

declare global {
  interface Bambora {
    InlineCheckout: typeof InlineCheckout;
    RedirectCheckout: typeof RedirectCheckout;
    ModalCheckout: typeof ModalCheckout;
    Errors: typeof Errors;
    Events: typeof Event;
    UI: typeof UI;
  }

  interface Window {
    Bambora: Bambora;
  }

  // tslint:disable-next-line:naming-convention
  const Bambora: Bambora;
}

export { UI, InlineCheckout, RedirectCheckout, ModalCheckout, Errors, Event };
