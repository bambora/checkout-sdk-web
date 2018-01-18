// tslint:disable:completed-docs
export function getHtmlBlobUrl(...strings: Array<string>): string {
  const blob = new Blob(strings, { type: "text/html" });
  return URL.createObjectURL(blob);
}

export default getHtmlBlobUrl;
