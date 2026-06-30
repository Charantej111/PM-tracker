import React from "react";
import { landingTokens } from "./designTokens";

export const GlassCard = ({ children, className = "", style = {} }) => {
  return (
    <div
      className={`${landingTokens.glass} ${landingTokens.radius} ${landingTokens.shadowSoft} p-6 transition-all duration-300 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};
export default GlassCard;
