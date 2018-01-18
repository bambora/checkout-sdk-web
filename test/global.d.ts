import "mocha";
import * as Chai from "chai";
import * as sinon from "sinon";

declare global {
  const expect: Chai.ExpectStatic;
  const sinon: sinon.SinonStatic;
}
