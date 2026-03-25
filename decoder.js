const txHex = "0200000000010131811cd355c357e0e01437d9bcf690df824e9ff785012b6115dfae3d8e8b36c10100000000fdffffff0220a107000000000016001485d78eb795bd9c8a21afefc8b6fdaedf718368094c08100000000000160014840ab165c9c2555d4a31b9208ad806f89d2535e20247304402207bce86d430b58bb6b79e8c1bbecdf67a530eff3bc61581a1399e0b28a741c0ee0220303d5ce926c60bf15577f2e407f28a2ef8fe8453abd4048b716e97dbb1e3a85c01210260828bc77486a55e3bc6032ccbeda915d9494eda17b4a54dbe3b24506d40e4ff43030e00";
function decodeTransaction(hex) {
  const bytes = Buffer.from(hex, 'hex');
  let offset = 0;
  const tx = {};

  tx.version = bytes.readUInt32LE(offset);
  offset += 4;

  let isSegwit = false;
  if (bytes[offset] === 0x00 && bytes[offset + 1] === 0x01) {
    tx.marker = "00";
    tx.flag = "01";
    isSegwit = true;
    offset += 2;
  }

  let vi = decodeVarInt(bytes, offset);
  const inputCount = vi.value;
  offset += vi.size;

  tx.inputs = [];
  for (let i = 0; i < inputCount; i++) {
    const input = {};

    const txidBytes = bytes.slice(offset, offset + 32);
    input.txid = Buffer.from(txidBytes).reverse().toString('hex');
    offset += 32;

    input.vout = bytes.readUInt32LE(offset);
    offset += 4;

    vi = decodeVarInt(bytes, offset);
    const scriptLen = vi.value;
    offset += vi.size;
    input.scriptSig = scriptLen === 0 ? "" : bytes.slice(offset, offset + scriptLen).toString('hex');
    offset += scriptLen;

    const seqValue = bytes.readUInt32LE(offset);
    input.sequence = "0x" + seqValue.toString(16).padStart(8, '0').toLowerCase();
    offset += 4;

    tx.inputs.push(input);
  }

  vi = decodeVarInt(bytes, offset);
  const outputCount = vi.value;
  offset += vi.size;

  tx.outputs = [];
  for (let i = 0; i < outputCount; i++) {
    const output = {};
    output.amount = Number(bytes.readBigUInt64LE(offset));
    offset += 8;

    vi = decodeVarInt(bytes, offset);
    const scriptLen = vi.value;
    offset += vi.size;
    output.scriptPubKey = bytes.slice(offset, offset + scriptLen).toString('hex');
    offset += scriptLen;

    tx.outputs.push(output);
  }

  if (isSegwit) {
    tx.witness = [];
    for (let i = 0; i < inputCount; i++) {
      vi = decodeVarInt(bytes, offset);
      const stackSize = vi.value;
      offset += vi.size;
      const stack = [];
      for (let j = 0; j < stackSize; j++) {
        vi = decodeVarInt(bytes, offset);
        const itemLen = vi.value;
        offset += vi.size;
        stack.push(bytes.slice(offset, offset + itemLen).toString('hex'));
        offset += itemLen;
      }
      tx.witness.push(stack);
    }
  }

  tx.locktime = bytes.readUInt32LE(offset);

  return tx;
}

function decodeVarInt(bytes, offset) {
  const first = bytes[offset];
  if (first < 0xfd) return { value: first, size: 1 };
  if (first === 0xfd) return { value: bytes.readUInt16LE(offset + 1), size: 3 };
  if (first === 0xfe) return { value: bytes.readUInt32LE(offset + 1), size: 5 };
  return { value: Number(bytes.readBigUInt64LE(offset + 1)), size: 9 };
}

const decoded = decodeTransaction(txHex);
console.log(JSON.stringify(decoded, null, 2));

