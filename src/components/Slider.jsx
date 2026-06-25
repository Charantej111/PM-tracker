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
        background: `linear-gradient(to right, rgb(var(--accent)) ${percentage}%, var(--slider-track) ${percentage}%)`
      }}
      className={`w-full cursor-pointer h-2 rounded-lg appearance-none accent-accent ${className}`}
    />
  );
}
