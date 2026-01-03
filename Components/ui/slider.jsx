import React from 'react'
export function Slider({ value, onValueChange, min=0, max=100, step=1, className }) {
  const v = Array.isArray(value) ? value[0] : value ?? min
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={v}
      onChange={(e) => {
        const nv = Number(e.target.value)
        if (onValueChange) onValueChange([nv])
      }}
      className={className}
    />
  )
}
export default Slider
