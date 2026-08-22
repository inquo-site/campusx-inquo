import { Tag } from "lucide-react";

export function DiscountBadge({ label = "50% OFF", className = "" }: { label?: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ${className}`}
    >
      <Tag className="h-3 w-3" />
      {label}
    </span>
  );
}

export function DiscountRibbon({ label = "50% OFF" }: { label?: string }) {
  return (
    <div className="absolute -right-8 top-5 rotate-45 bg-red-500 px-10 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
      {label}
    </div>
  );
}

export function StrikethroughPrice({ amount }: { amount: number }) {
  return <span className="text-sm text-muted-foreground line-through">₹{amount.toLocaleString("en-IN")}</span>;
}
