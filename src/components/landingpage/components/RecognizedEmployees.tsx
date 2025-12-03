import * as React from "react";
import { RecognizedEmployeeType } from "../../../utils/types";

interface RecognizedEmployeesProps {
  data: RecognizedEmployeeType[];
}

const RecognizedEmployees: React.FC<RecognizedEmployeesProps> = ({ data }) => {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="lp-card lp-recognized">
      <div className="lp-rec-head">
        <h3>Recognized Employees</h3>
        <button className="lp-viewall small">View all ➜</button>
      </div>

      <ul className="lp-rec-list">
        {hasData ? (
          data.map((emp) => (
            <li key={emp.id}>
              <img
                src={emp.avatar}
                alt={emp.name}
                className="lp-rec-thumb"
              />

              <div>
                <div className="lp-rec-name">{emp.name}</div>
                <div className="lp-rec-role">
                  {emp.position} {emp.department ? `— ${emp.department}` : ""}
                </div>
              </div>
              
              <div className="lp-rec-date">{emp.recognition}</div>
            </li>
          ))
        ) : (
          <li>
            <div className="lp-rec-name">No recognized employees available</div>
          </li>
        )}
      </ul>
    </div>
  );
};

export default RecognizedEmployees;
