import * as React from "react";
import { JobOpeningType } from "../../../utils/types";

interface JobOpeningsProps {
  jobOpenings: JobOpeningType[];
}

const JobOpenings: React.FC<JobOpeningsProps> = ({ jobOpenings }) => {
  const hasJobs = Array.isArray(jobOpenings) && jobOpenings.length > 0;

  return (
    <div className="lp-card lp-jobs">
      <div className="lp-section-header">
        <h3>Job Openings</h3>
        <button className="lp-viewall">View all ➜</button>
      </div>

      {hasJobs ? (
        jobOpenings.map((job) => (
          <div className="lp-job-item" key={job.id}>
            <div className="lp-job-role">{job.title}</div>
            <div className="lp-job-meta">
              Experience: {job.experience} • Location: {job.location}
            </div>
            <div className="lp-job-date">Date posted: {job.dateposted}</div>
          </div>
        ))
      ) : (
        <div className="lp-job-item">
          <div className="lp-job-role">No job openings available</div>
        </div>
      )}
    </div>
  );
};

export default JobOpenings;
