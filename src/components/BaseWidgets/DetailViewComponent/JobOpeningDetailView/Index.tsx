import * as React from 'react';
import './JobOpeningDetailView.css';
import { dateFormat } from '../../../../utils/utils';


interface JobOpening {
  id: string;
  title: string;
  experience: string;
  BU: string;
  dateposted: string;
  location: string;
  JDAttachments: string;
  description?: string;
}

interface JobOpeningsDetailProps {
  jobData: JobOpening;
}

const JobOpeningsDetail: React.FC<JobOpeningsDetailProps> = ({ jobData }) => {
  const { title, experience, dateposted, location, description, BU, JDAttachments } = jobData;

  // Function to render description with proper paragraph breaks
  const renderDescription = (desc: string) => {
    // Split by double newlines or single newlines to create paragraphs
    const paragraphs = desc
      .split(/\n\s*\n/)
      .filter(para => para.trim().length > 0);

    return paragraphs.map((paragraph, index) => (
      <p key={index}>{paragraph.trim()}</p>
    ));
  };

  return (
    <div className="job-listing-detail-container">
      {/* Job Header */}
      <header className="job-listing-header">
        <h1 className="job-listing-title">{title}</h1>

        <div className="job-listing-meta">
          <div className="job-meta-item">
            <span className="job-meta-label">Experience:</span>
            <span className="job-meta-value">{experience}</span>
          </div>

          <div className="job-meta-item">
            <span className="job-meta-label">Posted:</span>
            <span className="job-meta-value">{dateFormat(dateposted)}</span>
          </div>

          <div className="job-meta-item">
            <span className="job-meta-label">Location:</span>
            <span className="job-meta-value">{location}</span>
          </div>

          <div className="job-meta-item">
            <span className="job-meta-label">BU/Client:</span>
            <span className="job-meta-value">{BU}</span>
          </div>
        </div>
      </header>

      {/* Job Description */}
      {description && (
        <section className="job-description-section">
          <h2 className="job-description-heading">Job Description</h2>
          <div className="job-description-content">
            {renderDescription(description)}
          </div>
        </section>
      )}

      {/* PDF Preview */}
      {JDAttachments && (
        <div className="job-pdf-section">
          <button
            onClick={() => window.open(JDAttachments, '_blank')}
            className="job-opening-preview-button-universal-data-management"
          >
            📄 View JD in PDF
          </button>
        </div>
      )}

      {/* Call to Action */}
      <section className="job-cta-section">
        <p className="job-apply-text">
          Know someone who’d be a great fit for our team? We’re always on the lookout for top talent!
        </p>
        <p className="job-contact-info">
          Send their CV to <a href="mailto:Jobs@pierianservices.com" className="job-email">Jobs@pierianservices.com</a>
        </p>
        <p className="job-referral-text">
          Your referral could be the next great addition to our organization!
        </p>
      </section>

    </div>
  );
};

export default JobOpeningsDetail;