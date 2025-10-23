declare module 'encoding-japanese' {
  export type Encoding =
    | 'UTF32'
    | 'UTF16'
    | 'UTF16BE'
    | 'UTF16LE'
    | 'BINARY'
    | 'ASCII'
    | 'JIS'
    | 'UTF8'
    | 'EUCJP'
    | 'SJIS'
    | 'UNICODE'
    | 'AUTO';

  export interface ConvertOptions {
    to: Encoding;
    from?: Encoding;
    type?: 'string' | 'arraybuffer' | 'array';
    bom?: boolean | 'auto';
  }

  export function detect(data: string | Uint8Array | number[]): Encoding | false;

  export function convert(
    data: string | Uint8Array | number[],
    options: ConvertOptions | Encoding
  ): Uint8Array | number[];

  export function codeToString(code: Uint8Array | number[]): string;

  export function stringToCode(str: string): number[];

  export function urlEncode(data: number[]): string;

  export function urlDecode(str: string): number[];

  export function base64Encode(data: number[]): string;

  export function base64Decode(str: string): number[];

  const Encoding: {
    detect: typeof detect;
    convert: typeof convert;
    codeToString: typeof codeToString;
    stringToCode: typeof stringToCode;
    urlEncode: typeof urlEncode;
    urlDecode: typeof urlDecode;
    base64Encode: typeof base64Encode;
    base64Decode: typeof base64Decode;
  };

  export default Encoding;
}
