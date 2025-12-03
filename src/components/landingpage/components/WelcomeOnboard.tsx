import * as React from "react";
import { useState } from "react";
import { WelcomeMessageType } from "../../../utils/types";

interface WelcomeOnboardProps {
  data: WelcomeMessageType[];
}

const WelcomeOnboard: React.FC<WelcomeOnboardProps> = ({ data }) => {
  const hasData = Array.isArray(data) && data.length > 0;
  const [index, setIndex] = useState(0);
  console.log(setIndex);
  

  if (!hasData) {
    return (
      <div className="lp-card lp-welcome">
        <div>
          <div className="lp-welcome-sub">We're excited to have you with us</div>
          <div className="lp-welcome-main">
            Welcome on board, <strong>New Employee</strong>
          </div>
        </div>
      </div>
    );
  }

  const current = data[index];

  return (
    <div className="lp-card lp-welcome">
      <div>
        <div className="lp-welcome-sub">{current.message}</div>

        <div className="lp-welcome-main">
          Welcome on board, <strong>{current.employeeName}</strong>
        </div>
      </div>

      <img
        src={current.employeeImage}
        alt={current.employeeName}
        className="lp-welcome-thumb"
      />
    </div>
  );
};

export default WelcomeOnboard;
