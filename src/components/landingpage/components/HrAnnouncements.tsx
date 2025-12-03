import * as React from "react";
import { useState } from "react";
import { HRAnnouncementType } from "../../../utils/types";
import Announcement from "../assets/announcement.svg";

interface HrAnnouncementsProps {
  data: HRAnnouncementType[];
}

const HrAnnouncements: React.FC<HrAnnouncementsProps> = ({ data }) => {
  const hasData = Array.isArray(data) && data.length > 0;
  const [index, setIndex] = useState(0);

  if (!hasData) {
    return (
      <div className="lp-card lp-hr">
        <div className="lp-section-header">
          <h3>HR Announcements</h3>
        </div>
        <p>No announcements available.</p>
      </div>
    );
  }

  const current = data[index];

  const handlePrev = () =>
    setIndex((index - 1 + data.length) % data.length);

  const handleNext = () =>
    setIndex((index + 1) % data.length);

  return (
    <div className="lp-card lp-hr">
      <div className="lp-section-header">
        <h3>HR Announcements</h3>
        <button className="lp-viewall">View all ➜</button>
      </div>

      <div className="lp-hr-img">
        <img src={Announcement} alt="announcement" />
      </div>

      <h4 className="lp-hr-title">{current.subtitle}</h4>
      <p className="lp-hr-text">{current.description}</p>

      <div className="lp-hr-nav">
        <button className="lp-circle lp-hr-button small" onClick={handlePrev}>
          ◀
        </button>
        <button className="lp-circle lp-hr-button small" onClick={handleNext}>
          ▶
        </button>
      </div>
    </div>
  );
};

export default HrAnnouncements;
