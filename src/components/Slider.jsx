export default function Slider({ value = 0, onChange, min = 0, max = 100, step = 1, className = "" }) {
  const safeValue = value ?? 0;
  const percentage = max > min ? ((safeValue - min) / (max - min)) * 100 : 0;

  const handleChange = (e) => {
    if (onChange) {
      onChange(Number(e.target.value));
    }
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={safeValue}
      onChange={handleChange}
      style={{
        backgroundImage: `linear-gradient(to right, var(--accent) ${percentage}%, transparent ${percentage}%)`
      }}
      className={`w-full cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none accent-accent dark:bg-slate-800 ${className}`}
    />
  );
}
