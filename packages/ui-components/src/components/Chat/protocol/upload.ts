import {CarReader} from '@ipld/car';
import * as Delegation from '@ucanto/core/delegation';
import type {Filelike} from 'web3.storage';

export class Upload implements Filelike {
  name: string;
  data: Uint8Array;

  constructor(name: string, data: Uint8Array) {
    this.name = name;
    this.data = data;
  }

  stream(): ReadableStream {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return new ReadableStream({
      start(controller) {
        controller.enqueue(Buffer.from(self.data));
        controller.close();
      },
    });
  }
}

export async function parseW3UpProof(data: string) {
  const blocks = [];
  const reader = await CarReader.fromBytes(Buffer.from(data, 'base64'));
  for await (const block of reader.blocks()) {
    blocks.push(block);
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return Delegation.importDAG(blocks);
}
