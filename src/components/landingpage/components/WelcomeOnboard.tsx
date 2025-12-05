import * as React from "react";
import { useState, useEffect } from "react";
import { WelcomeMessageType } from "../../../utils/types";

interface WelcomeOnboardProps {
  data?: WelcomeMessageType[];  
}

const WelcomeOnboard: React.FC<WelcomeOnboardProps> = ({ data = [] }) => {
  const [index, setIndex] = useState(0);

  // Reset index when data changes
  useEffect(() => {
    if (index >= data.length) {
      setIndex(0);
    }
  }, [data, index]);

  // No data fallback
  if (!data || data.length === 0) {
    return (
      <div className="lp-card lp-welcome">
        <div className="lp-welcome-sub">We're excited to have you with us</div>
        <div className="lp-welcome-main">
          Welcome on board, <strong>New Employee</strong>
        </div>
      </div>
    );
  }

  const current = data[index];

  // Prev & Next logic (same as 1st code)
  const prev = () => {
    setIndex((prevIndex) => (prevIndex - 1 + data.length) % data.length);
  };

  const next = () => {
    setIndex((prevIndex) => (prevIndex + 1) % data.length);
  };

  return (
    <div className="lp-card lp-welcome">

      {/* Text Section */}
      <div>
        <div className="lp-welcome-sub">
          {current?.message ?? "No message"}
        </div>

        <div className="lp-welcome-main">
          Welcome on board,
          <strong>{current?.employeeName ?? "Employee"}</strong>
        </div>
      </div>

      {/* Image Section */}
      {current?.employeeImage && (
        <img
          src={current.employeeImage}
          alt={current.employeeName ?? "Employee"}
          className="lp-welcome-thumb"
        />
      )}

      {/* Navigation Buttons */}
      {data.length > 1 && (
        <div className="lp-lead-nav">
          <button className="lp-circle small" onClick={prev}>◀</button>
          <button className="lp-circle small" onClick={next}>▶</button>
        </div>
      )}
    </div>
  );
};

export default WelcomeOnboard;
