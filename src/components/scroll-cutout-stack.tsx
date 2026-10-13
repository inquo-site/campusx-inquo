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
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let destroyScroll: (() => void) | undefined;
    let generation = 0;

    const configureScroll = async () => {
      const currentGeneration = ++generation;
      destroyScroll?.();
      destroyScroll = undefined;
      if (preference.matches) return;

      // Load only in the browser; leave mobile touch and nested tools native.
      const { default: Lenis } = await import("lenis");
      if (disposed || preference.matches || currentGeneration !== generation) return;
      const scroll = new Lenis({
        autoRaf: true,
        duration: 1.15,
        easing: (progress: number) => 1 - Math.pow(1 - progress, 4),
        smoothWheel: true,
        syncTouch: false,
        anchors: true,
        prevent: (node) => Boolean(node.closest(
          '[role="dialog"], [role="menu"], [data-lenis-prevent], [data-radix-scroll-area-viewport], textarea, select',
        )),
      });
      destroyScroll = () => scroll.destroy();
    };

    void configureScroll();
    preference.addEventListener("change", configureScroll);
    return () => {
      disposed = true;
      generation++;
      preference.removeEventListener("change", configureScroll);
      destroyScroll?.();
    };
  }, []);

  return (
    <div className="scroll-cutout-stack">
      {Children.toArray(children).map((child, index) => (
        <CutoutLayer key={index}>{child}</CutoutLayer>
      ))}
    </div>
  );
}