// tslint:disable-next-line:no-reference
/// <reference path="./global.d.ts" />

import ModalCheckout, { Style, delay } from "../src/modalCheckout";
import { LoadSessionError } from "../src/errors";
import AsyncIframe from "../src/asyncIframe";
import { getHtmlBlobUrl, handshakeHelper, eventHelper } from "./helpers";
import CheckoutEvent from "../src/events";

describe("ModalCheckout", () => {
  describe("#constructor()", () => {
    it("creates one style sheet", () => {
      const blobUrl = getHtmlBlobUrl(handshakeHelper());
      const checkoutUrl = sinon
        .stub(ModalCheckout.prototype, "_checkoutUrl" as any)
        .get(() => blobUrl);

      // There should be no style sheets before instantiating ModalCheckout:
      expect(document.querySelectorAll("style[bc-style]").length).to.equal(0);

      // tslint:disable-next-line:no-unused-expression
      new ModalCheckout("123456");

      const styleElements = document.querySelectorAll<HTMLStyleElement>(
        "style[bc-style]"
      );
      const styleSheet = styleElements[0].sheet as CSSStyleSheet;

      // Now, a style sheet should have been injected:
      expect(styleElements.length).to.equal(1);

      // It should have some CSS rules:
      expect(styleSheet.rules.length).to.be.greaterThan(0);

      // It should be prepended in the head, so it's easily overridable:
      expect(document.head.firstChild).to.equal(styleElements[0]);

      // tslint:disable-next-line:no-unused-expression
      new ModalCheckout("654321");

      // There should still just be one:
      expect(document.querySelectorAll("style[bc-style]").length).to.equal(1);

      checkoutUrl.restore();
    });

    it("creates iframe container, overlay container, backdrop, and focus traps", async () => {
      const blobUrl = getHtmlBlobUrl(handshakeHelper());
      const checkoutUrl = sinon
        .stub(ModalCheckout.prototype, "_checkoutUrl" as any)
        .get(() => blobUrl);

      const checkout = new ModalCheckout("123456");

      const iframe = await checkout.iframe;
      const iframeContainer = iframe.parentElement!;
      const overlayContainer = iframeContainer.parentElement!;
      const backdrop = overlayContainer.firstChild as HTMLElement;
      const firstFocusTrap = iframeContainer.previousElementSibling!;
      const secondFocusTrap = iframeContainer.nextElementSibling!;

      expect(
        iframeContainer.classList.contains(Style.IframeContainer)
      ).to.equal(true);
      expect(
        overlayContainer.classList.contains(Style.OverlayContainer)
      ).to.equal(true);
      expect(backdrop.classList.contains(Style.Backdrop)).to.equal(true);

      expect(firstFocusTrap.getAttribute("tabindex")).to.equal("0");
      expect(secondFocusTrap.getAttribute("tabindex")).to.equal("0");

      checkoutUrl.restore();
    });
  });

  describe("#initialize()", () => {
    it("resolves upon successful load of session", async () => {
      const newSessionToken = "654321";
      const postMessage = sinon.stub(AsyncIframe.prototype, "postMessage");
      const blobUrl = getHtmlBlobUrl(handshakeHelper());
      const checkoutUrl = sinon
        .stub(ModalCheckout.prototype, "_checkoutUrl" as any)
        .get(() => blobUrl);

      postMessage.resolves(newSessionToken);

      const checkout = new ModalCheckout("123456");

      expect(await checkout.initialize(newSessionToken)).to.equal(
        newSessionToken
      );

      postMessage.restore();
      checkoutUrl.restore();
    });

    it("throws LoadSessionError on failure to load session", async () => {
      const newSessionToken = "654321";
      const postMessage = sinon.stub(AsyncIframe.prototype, "postMessage");
      const blobUrl = getHtmlBlobUrl(handshakeHelper());
      const checkoutUrl = sinon
        .stub(ModalCheckout.prototype, "_checkoutUrl" as any)
        .get(() => blobUrl);

      postMessage.rejects();

      const checkout = new ModalCheckout("123456");

      try {
        await checkout.initialize(newSessionToken);
        throw new Error("An error should be thrown");
      } catch (error) {
        expect(error).to.be.instanceof(LoadSessionError);
      }

      postMessage.restore();
      checkoutUrl.restore();
    });

    it("throws LoadSessionError on attempt to load another session", async () => {
      const newSessionToken = "654321";
      const postMessage = sinon.stub(AsyncIframe.prototype, "postMessage");
      const blobUrl = getHtmlBlobUrl(handshakeHelper());
      const checkoutUrl = sinon
        .stub(ModalCheckout.prototype, "_checkoutUrl" as any)
        .get(() => blobUrl);

      postMessage.resolves(newSessionToken);

      const checkout = new ModalCheckout("123456");

      await checkout.initialize(newSessionToken);

      expect(await checkout.initialize(newSessionToken)).to.equal(
        newSessionToken
      );

      try {
        await checkout.initialize("another");
        throw new Error("An error should be thrown");
      } catch (error) {
        expect(error).to.be.instanceof(LoadSessionError);
      }

      postMessage.restore();
      checkoutUrl.restore();
    });
  });

  describe("#iframe", () => {
    it("resolves to a HTMLIFrameElement", async () => {
      const blobUrl = getHtmlBlobUrl(handshakeHelper());
      const checkoutUrl = sinon
        .stub(ModalCheckout.prototype, "_checkoutUrl" as any)
        .get(() => blobUrl);

      const checkout = new ModalCheckout("123456");
      const iframe = await checkout.iframe;

      expect(iframe).to.be.instanceof(HTMLIFrameElement);
      expect(iframe).not.to.be.instanceof(HTMLDivElement);

      checkoutUrl.restore();
    });
  });

  describe("#on()", () => {
    it("calls handler upon receiving events", async () => {
      const blobUrl = getHtmlBlobUrl(
        handshakeHelper(
          true,
          eventHelper(CheckoutEvent.Authorize, { transactionId: "123" })
        )
      );

      const checkoutUrl = sinon
        .stub(ModalCheckout.prototype, "_checkoutUrl" as any)
        .get(() => blobUrl);

      const { type, event } = await new Promise<{ type: string; event: any }>(
        resolve => {
          const checkout = new ModalCheckout("123456");
          checkout.on("*", (t, e) => resolve({ type: t, event: e }));
        }
      );

      expect(type).to.equal(CheckoutEvent.Authorize);
      expect(event.transactionId).to.equal("123");

      checkoutUrl.restore();
    });
  });

  describe("#show()", () => {
    it("displays overlay and resolves upon animation finish", async () => {
      const blobUrl = getHtmlBlobUrl(handshakeHelper());

      const checkoutUrl = sinon
        .stub(ModalCheckout.prototype, "_checkoutUrl" as any)
        .get(() => blobUrl);

      const animationDuration = sinon
        .stub(ModalCheckout, "ANIMATION_DURATION")
        .get(() => 50);

      const checkout = new ModalCheckout("123456");
      const iframe = await checkout.iframe;
      const overlayContainer = iframe.parentElement!.parentElement!;

      expect(overlayContainer.style.display).to.equal("none");
      expect(overlayContainer.classList.contains(Style.Enter)).to.equal(false);
      expect(overlayContainer.classList.contains(Style.EnterActive)).to.equal(
        false
      );

      const showPromise = checkout.show();
      await delay(10);

      expect(overlayContainer.style.display).to.equal("block");
      expect(overlayContainer.classList.contains(Style.Enter)).to.equal(true);
      expect(overlayContainer.classList.contains(Style.EnterActive)).to.equal(
        true
      );

      await showPromise;

      expect(overlayContainer.style.display).to.equal("block");
      expect(overlayContainer.classList.contains(Style.Enter)).to.equal(false);
      expect(overlayContainer.classList.contains(Style.EnterActive)).to.equal(
        false
      );

      checkoutUrl.restore();
      animationDuration.restore();
    });
  });

  describe("#hide()", () => {
    it("hides overlay and resolves upon animation finish", async () => {
      const blobUrl = getHtmlBlobUrl(handshakeHelper());

      const checkoutUrl = sinon
        .stub(ModalCheckout.prototype, "_checkoutUrl" as any)
        .get(() => blobUrl);

      const animationDuration = sinon
        .stub(ModalCheckout, "ANIMATION_DURATION")
        .get(() => 50);

      const checkout = new ModalCheckout("123456");
      const iframe = await checkout.iframe;
      const overlayContainer = iframe.parentElement!.parentElement!;

      await checkout.show();

      expect(overlayContainer.style.display).to.equal("block");
      expect(overlayContainer.classList.contains(Style.Leave)).to.equal(false);
      expect(overlayContainer.classList.contains(Style.LeaveActive)).to.equal(
        false
      );

      const hidePromise = checkout.hide();
      await delay(10);

      expect(overlayContainer.style.display).to.equal("block");
      expect(overlayContainer.classList.contains(Style.Leave)).to.equal(true);
      expect(overlayContainer.classList.contains(Style.LeaveActive)).to.equal(
        true
      );

      await hidePromise;

      expect(overlayContainer.style.display).to.equal("none");
      expect(overlayContainer.classList.contains(Style.Leave)).to.equal(false);
      expect(overlayContainer.classList.contains(Style.LeaveActive)).to.equal(
        false
      );

      checkoutUrl.restore();
      animationDuration.restore();
    });
  });

  describe("#isActive", () => {
    it("is true when the modal is displayed and otherwise false", async () => {
      const blobUrl = getHtmlBlobUrl(handshakeHelper());

      const checkoutUrl = sinon
        .stub(ModalCheckout.prototype, "_checkoutUrl" as any)
        .get(() => blobUrl);

      const animationDuration = sinon
        .stub(ModalCheckout, "ANIMATION_DURATION")
        .get(() => 50);

      const checkout = new ModalCheckout("123456");

      expect(checkout.isActive).to.equal(false);
      await checkout.show();

      expect(checkout.isActive).to.equal(true);
      await checkout.hide();

      expect(checkout.isActive).to.equal(false);

      checkoutUrl.restore();
      animationDuration.restore();
    });
  });

  describe("#destroy()", () => {
    it("removes the iframe element from the DOM", async () => {
      const blobUrl = getHtmlBlobUrl(handshakeHelper());
      const checkoutUrl = sinon
        .stub(ModalCheckout.prototype, "_checkoutUrl" as any)
        .get(() => blobUrl);

      const checkout = new ModalCheckout("123456");
      const iframe = await checkout.iframe;

      expect(document.body.contains(iframe)).to.equal(true);

      checkout.destroy();

      expect(document.body.contains(iframe)).to.equal(false);

      checkoutUrl.restore();
    });

    it("removes iframe container, overlay container, backdrop, and focus traps", async () => {
      const blobUrl = getHtmlBlobUrl(handshakeHelper());
      const checkoutUrl = sinon
        .stub(ModalCheckout.prototype, "_checkoutUrl" as any)
        .get(() => blobUrl);

      const checkout = new ModalCheckout("123456");
      const iframe = await checkout.iframe;
      const iframeContainer = iframe.parentElement!;
      const overlayContainer = iframeContainer.parentElement!;
      const backdrop = overlayContainer.firstChild as HTMLElement;
      const firstFocusTrap = iframeContainer.previousElementSibling!;
      const secondFocusTrap = iframeContainer.nextElementSibling!;

      expect(document.body.contains(iframe)).to.equal(true);
      expect(document.body.contains(iframeContainer)).to.equal(true);
      expect(document.body.contains(overlayContainer)).to.equal(true);
      expect(document.body.contains(backdrop)).to.equal(true);
      expect(document.body.contains(firstFocusTrap)).to.equal(true);
      expect(document.body.contains(secondFocusTrap)).to.equal(true);

      checkout.destroy();

      expect(document.body.contains(iframe)).to.equal(false);
      expect(document.body.contains(iframeContainer)).to.equal(false);
      expect(document.body.contains(overlayContainer)).to.equal(false);
      expect(document.body.contains(backdrop)).to.equal(false);
      expect(document.body.contains(firstFocusTrap)).to.equal(false);
      expect(document.body.contains(secondFocusTrap)).to.equal(false);

      checkoutUrl.restore();
    });
  });
});
