export function toBase64(originalString: string) {
  return Buffer.from(originalString).toString('base64');
}
