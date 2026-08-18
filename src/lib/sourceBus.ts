/** Tiny pub/sub so Nav / Footer can open the source bundle panel. */
type Listener = () => void;
let listener: Listener | null = null;

export function openSourcePanel() {
  listener?.();
}

export function onOpenSource(fn: Listener) {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}
