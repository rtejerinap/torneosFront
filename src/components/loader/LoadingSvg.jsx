import React from "react";
import "./LoadingSvg.css";

const LoadingSvg = () => {
  return (
    <div className="loading-overlay">
      <div className="loader">
        <div className="load-inner load-one"></div>
        <div className="load-inner load-two"></div>
        <div className="load-inner load-three"></div>
        <span className="text">Cargando...</span>
      </div>
    </div>
  );
};

export default LoadingSvg;
