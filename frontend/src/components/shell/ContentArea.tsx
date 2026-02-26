export function ContentArea({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="h-full rounded-xl overflow-hidden shadow-sm"
      style={{ background: "var(--content-bg)" }}
    >
      <div className="h-full overflow-y-auto content-scroll">{children}</div>
    </div>
  );
}
