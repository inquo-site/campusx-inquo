import { Children, useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/** Tall layers scroll completely before pinning; later siblings cover them. */
function CutoutLayer({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    if (!layer) return;

    const measure = () => {
      const viewportHeight = window.innerHeight;
      const headerClearance = 96;
      const top = Math.min(headerClearance, viewportHeight - layer.offsetHeight);
      layer.style.setProperty("--layer-top", `${top}px`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(layer);
    window.addEventListener("resize", measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div ref={ref} className="scroll-cutout-layer" style={{ "--layer-top": "96px" } as CSSProperties}>
      {children}
    </div>
  );
}

export function ScrollCutoutStack({ children }: { children: ReactNode }) {
  return (
    <div className="scroll-cutout-stack">
      {Children.toArray(children).map((child, index) => (
        <CutoutLayer key={index}>{child}</CutoutLayer>
      ))}
    </div>
  );
}