import '@testing-library/jest-dom';

// react-router (v6/v7) expects these web APIs even in tests.
import {TextDecoder, TextEncoder} from 'node:util';

if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder;
}
if (!globalThis.TextDecoder) {
  globalThis.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder;
}
