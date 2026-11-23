export function MovementLoading() {
  return (
    <div className="space-y-3" aria-label="Loading money movements">
      {["one", "two", "three"].map((item) => (
        <div
          key={item}
          className="dash-panel h-24 animate-pulse"
        />
      ))}
    </div>
  );
}
