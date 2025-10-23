declare module 'three/examples/jsm/exporters/GLTFExporter' {
  export class GLTFExporter {
    parse(
      input: unknown,
      onCompleted: (result: ArrayBuffer | object) => void,
      onError?: (error: unknown) => void,
      options?: { binary?: boolean },
    ): void;
  }
}
