import * as React from "react";
import { useState, useEffect } from "react";
import { LeadershipMessageType } from "../../../utils/types";
import { useNavigate } from "react-router-dom";

interface LeadershipMessageProps {
  data: LeadershipMessageType[];
}

const LeadershipMessage: React.FC<LeadershipMessageProps> = ({ data }) => {
  const navigate = useNavigate();

  const hasData = Array.isArray(data) && data.length > 0;
  const [index, setIndex] = useState(0);

  // Keep index valid if data changes
  useEffect(() => {
    if (!hasData) {
      setIndex(0);
    } else if (index >= data.length) {
      setIndex(0);
    }
  }, [data, index, hasData]);

  // Current item (may be null initially)
  const current = hasData ? data[index] : null;

  // Navigation buttons
  const prev = () => {
    if (hasData) {
      setIndex((prev) => (prev - 1 + data.length) % data.length);
    }
  };

  const next = () => {
    if (hasData) {
      setIndex((prev) => (prev + 1) % data.length);
    }
  };

  // Navigate to list page
  const handleViewAll = () => {
    navigate("/list/LeadershipMessage");
  };

  // Navigate to detail page
  const handleClick = (id?: number) => {
    if (id !== undefined) {
      navigate(`/detail/LeadershipMessage/${id}`);
    }
  };

  return (
    <div className="lp-card lp-leadership">
      <div className="lp-lead-head">
        <div className="lp-lead-title">Leadership Message</div>

        {hasData && (
          <button className="lp-viewall small" onClick={handleViewAll}>
            View all ➜
          </button>
        )}
      </div>

      <div className="lp-lead-quote">“</div>

      {/* Message Section */}
      {hasData ? (
        <p className="lp-lead-text" onClick={() => handleClick(current?.id)}>
          {current?.message}
        </p>
      ) : (
        <p className="lp-lead-text">Loading...</p>
      )}

      {/* Footer Section */}
      {hasData && (
        <div className="lp-lead-footer">
          <img
            src={current?.avatar}
            alt={current?.name}
            className="lp-lead-avatar"
          />

          <div>
            <div className="lp-lead-name">{current?.name}</div>
            <div className="lp-lead-role">{current?.title}</div>
          </div>

          <div className="lp-lead-nav">
            <button className="lp-circle small" onClick={prev}>
              ◀
            </button>
            <button className="lp-circle small" onClick={next}>
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadershipMessage;
