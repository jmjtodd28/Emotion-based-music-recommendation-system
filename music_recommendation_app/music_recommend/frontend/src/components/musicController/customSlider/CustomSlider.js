import React, { useEffect } from "react";
import "./customSlider.css";

const CustomSlider = ({
  maxVal,
  position,
  handleSliderChange,
  handleMouseUp,
  step,
}) => {
  const calculateGradient = () => {
    const percent = (position / maxVal) * 100;
    return `linear-gradient(to right, #ED3676 0%, #ED3676 ${percent}%, white ${percent}%, white 100%)`;
  };

  return (
    <input
      type="range"
      min={0}
      max={maxVal}
      step={step}
      value={position}
      onChange={handleSliderChange}
      onMouseUp={handleMouseUp}
      className="custom-slider h-0.5 rounded-full w-full"
      style={{ background: calculateGradient() }}
    ></input>
  );
};

export default CustomSlider;
