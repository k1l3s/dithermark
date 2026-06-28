// Reads/writes a Dithermark configuration JSON embedded in a PNG as a `tEXt`
// chunk (keyword "dithermark"). This lets the settings used to generate an image
// travel inside the exported PNG, so they can be loaded back and reapplied.
//
// PNG layout: 8-byte signature, then a sequence of chunks, each:
//   [length: 4 bytes BE][type: 4 ascii bytes][data: length bytes][crc: 4 bytes BE]
// A tEXt chunk's data is: keyword + 0x00 + text, all Latin-1.

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const CONFIG_KEYWORD = 'dithermark';

//standard CRC-32 (as used by PNG), table built once
const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        table[n] = c >>> 0;
    }
    return table;
})();

function crc32(bytes) {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
        crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

function latin1Bytes(str) {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        bytes[i] = str.charCodeAt(i) & 0xff;
    }
    return bytes;
}

function latin1String(bytes) {
    let str = '';
    for (let i = 0; i < bytes.length; i++) {
        str += String.fromCharCode(bytes[i]);
    }
    return str;
}

function readUint32BE(bytes, offset) {
    return (
        ((bytes[offset] << 24) |
            (bytes[offset + 1] << 16) |
            (bytes[offset + 2] << 8) |
            bytes[offset + 3]) >>>
        0
    );
}

function writeUint32BE(bytes, offset, value) {
    bytes[offset] = (value >>> 24) & 0xff;
    bytes[offset + 1] = (value >>> 16) & 0xff;
    bytes[offset + 2] = (value >>> 8) & 0xff;
    bytes[offset + 3] = value & 0xff;
}

function hasPngSignature(bytes) {
    if (bytes.length < 8) {
        return false;
    }
    return PNG_SIGNATURE.every((b, i) => bytes[i] === b);
}

//builds a tEXt chunk (length + type + data + crc) for the given keyword/text
function buildTextChunk(keyword, text) {
    const keywordBytes = latin1Bytes(keyword);
    const textBytes = latin1Bytes(text);
    const dataLength = keywordBytes.length + 1 + textBytes.length;

    const chunk = new Uint8Array(12 + dataLength);
    writeUint32BE(chunk, 0, dataLength);
    //type 'tEXt'
    chunk[4] = 0x74;
    chunk[5] = 0x45;
    chunk[6] = 0x58;
    chunk[7] = 0x74;
    chunk.set(keywordBytes, 8);
    chunk[8 + keywordBytes.length] = 0; //null separator
    chunk.set(textBytes, 8 + keywordBytes.length + 1);

    //crc is over type + data (everything from index 4 up to the crc field)
    const crc = crc32(chunk.subarray(4, 8 + dataLength));
    writeUint32BE(chunk, 8 + dataLength, crc);

    return chunk;
}

/**
 * Returns a new PNG byte array with the config JSON embedded as a tEXt chunk
 * (inserted right before the IEND chunk). Returns the input unchanged if it
 * isn't a valid PNG.
 *
 * @param {Uint8Array} pngBytes
 * @param {string} configJson
 * @returns {Uint8Array}
 */
export function embedConfigInPng(pngBytes, configJson) {
    if (!hasPngSignature(pngBytes)) {
        return pngBytes;
    }

    //walk chunks to find the start of IEND
    let offset = 8;
    let iendStart = -1;
    while (offset + 8 <= pngBytes.length) {
        const length = readUint32BE(pngBytes, offset);
        const type = latin1String(pngBytes.subarray(offset + 4, offset + 8));
        if (type === 'IEND') {
            iendStart = offset;
            break;
        }
        offset += 12 + length;
    }
    if (iendStart < 0) {
        return pngBytes;
    }

    const chunk = buildTextChunk(CONFIG_KEYWORD, configJson);
    const result = new Uint8Array(pngBytes.length + chunk.length);
    result.set(pngBytes.subarray(0, iendStart), 0);
    result.set(chunk, iendStart);
    result.set(pngBytes.subarray(iendStart), iendStart + chunk.length);

    return result;
}

/**
 * Extracts the embedded config JSON string from a PNG, or null if not present.
 *
 * @param {Uint8Array} pngBytes
 * @returns {string|null}
 */
export function extractConfigFromPng(pngBytes) {
    if (!hasPngSignature(pngBytes)) {
        return null;
    }

    let offset = 8;
    while (offset + 8 <= pngBytes.length) {
        const length = readUint32BE(pngBytes, offset);
        const type = latin1String(pngBytes.subarray(offset + 4, offset + 8));
        if (type === 'tEXt') {
            const data = pngBytes.subarray(offset + 8, offset + 8 + length);
            const nullIndex = data.indexOf(0);
            if (nullIndex > 0) {
                const keyword = latin1String(data.subarray(0, nullIndex));
                if (keyword === CONFIG_KEYWORD) {
                    return latin1String(data.subarray(nullIndex + 1));
                }
            }
        }
        if (type === 'IEND') {
            break;
        }
        offset += 12 + length;
    }

    return null;
}
