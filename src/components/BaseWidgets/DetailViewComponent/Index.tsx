import * as React from 'react';
import './DetailViewComponent.css';
import { DetailViewPropsLeadershipMessageType, DetailViewPropsType } from '../../../utils/types';
import { dateFormat } from '../../../utils/utils';

interface DetailComponentProps {
  DetailData: DetailViewPropsType | DetailViewPropsLeadershipMessageType;
  Title: string;
  ListName: string;
  id: string;
}

const DetailViewComponent: React.FC<DetailComponentProps> = ({
  DetailData,
  ListName
}) => {
  // LeadershipMessage case
  if (ListName === "LeadershipMessage" || ListName === "RecogonizedEmployee" || ListName === "HRAnnouncements") {
    const data = DetailData as DetailViewPropsLeadershipMessageType;

    return (
      <div className="detail-view-container detail-view-leadership-message-container">
        {/* Leadership Profile Section */}
        <header className="detail-view-leadership-profile-header">
          <div className="detail-view-leadership-profile-info">
            <div className="detail-view-leadership-avatar-container">
              {data.image && (
                <img
                  src={data.image}
                  alt={data.employeeName}
                  className="detail-view-leadership-avatar"
                />
              )}
            </div>
            <div className="detail-view-leadership-details">
              <h1 className="detail-view-leadership-name">{data.employeeName}</h1>
              {data.designation && (
                <p className="detail-view-leadership-designation">{data.designation} {data.department && <>| {data.department}</>}</p>
              )}

              {data.date && (
                <span className="detail-view-leadership-date">{dateFormat(data.date)}</span>
              )}
            </div>
          </div>
        </header>

        {/* Leadership Message Content */}
        <main className="detail-view-leadership-message-content">
          <div className="detail-view-leadership-message-text">
            {data?.message}
          </div>
          {data?.recognizedBy && (
            <div className="detail-view-leadership-message-recognized-by">
              <strong>Appreciated by,</strong>
              <br />
              {data.recognizedBy}
              <br />
              {data.recognizedByCompanyName} – {data.recognizedByDesignation}
            </div>

          )}
        </main>
      </div>
    );
  }

  // Default layout for other list types
  const data = DetailData as DetailViewPropsType;

  return (
    <div className="detail-view-container">
      {/* Article Header */}
      <header className="detail-view-article-header">
        <h1 className="detail-view-article-title">{data.title}</h1>
        {data.date && (
          <div className="detail-view-article-meta">
            <span className="detail-view-article-date">{dateFormat(data.date)}</span>
          </div>
        )}

      </header>

      {/* Hero Image */}
      {data.heroImage && (
        <div className="detail-view-hero-image-container">
          <img src={data.heroImage} alt={data.title} className="detail-view-hero-image" />
        </div>
      )}

      {/* Article Content */}
      <main className="detail-view-article-content">
        {data.content?.map((section, index) => (
          <section key={index} className="detail-view-content-section">
            {section.heading && (
              <h2 className="detail-view-section-heading">{section.heading}  {data.publishType && <>| {data.publishType}</>}</h2>
            )}
            {section.paragraphs.map((paragraph, pIndex) => (
              <p key={pIndex} className="detail-view-section-paragraph">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </main>
    </div>
  );
};

export default DetailViewComponent;
