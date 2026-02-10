const PICO_PER_XMR = 1_000_000_000_000;
const picoToXmr = (p: number | null) => p != null ? p / PICO_PER_XMR : 0;
export default picoToXmr;
