// tslint:disable-next-line:no-reference
/// <reference path="./global.d.ts" />

import RedirectCheckout from "../src/redirectCheckout";
import { NoSessionTokenProvidedError } from "../src/errors";

describe("RedirectCheckout", () => {
  describe("#constructor()", () => {
    it("redirects when a session token is provided", () => {
      const redirect = sinon.stub(
        RedirectCheckout.prototype,
        "_redirect" as any
      );

      // tslint:disable-next-line:no-unused-expression
      new RedirectCheckout("123456");

      sinon.assert.calledWith(
        redirect,
        "https://v1.checkout.bambora.com/123456?ui=fullscreen&language=en-US#eyJ2ZXJzaW9uIjoiTlBNX1ZFUlNJT04ifQ=="
      );

      redirect.restore();
    });

    it("does not redirect when the session token is not provided", () => {
      const redirect = sinon.stub(
        RedirectCheckout.prototype,
        "_redirect" as any
      );

      // tslint:disable-next-line:no-unused-expression
      new RedirectCheckout(null);

      sinon.assert.notCalled(redirect);
      redirect.restore();
    });
  });

  describe("#initialize()", () => {
    it("provides a redirect URL in a Promise result when the session token is provided", async () => {
      // Calling initialize should perform the redirect:
      const checkout = new RedirectCheckout(null);

      expect(await checkout.initialize("123456")).to.equal(
        "https://v1.checkout.bambora.com/123456?ui=fullscreen&language=en-US#eyJ2ZXJzaW9uIjoiTlBNX1ZFUlNJT04ifQ=="
      );

      // Calling initialize without ever providing a session token should throw a NoSessionTokenProvidedError:
      const checkout2 = new RedirectCheckout(null);

      try {
        await checkout2.initialize();
        throw new Error("An error should be thrown");
      } catch (error) {
        expect(error).to.be.instanceof(NoSessionTokenProvidedError);
      }
    });
  });
});
