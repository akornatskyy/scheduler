import '@testing-library/jest-dom';
import {TextEncoder} from 'node:util';

if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder;
}
