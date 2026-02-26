export default function SettingsPage() {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold" style={{ color: "var(--content-text)" }}>Settings</h2>
      <p className="text-sm mt-1" style={{ color: "var(--content-text-secondary)" }}>
        Organization configuration, watchlist defaults, alert thresholds, and API keys.
      </p>
    </div>
  );
}
