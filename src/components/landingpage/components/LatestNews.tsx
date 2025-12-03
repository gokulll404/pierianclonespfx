import * as React from "react";
import { NewsEventType } from "../../../utils/types";

interface LatestNewsProps {
  newsEvents: NewsEventType[];
}

const LatestNews: React.FC<LatestNewsProps> = ({ newsEvents }) => {
  const hasNews = Array.isArray(newsEvents) && newsEvents.length > 0;

  return (
    <div className="lp-card lp-latest-news">
      <div className="lp-section-header">
        <h3>Latest News & Events</h3>
        <button className="lp-viewall">View all ➜</button>
      </div>

      <ul className="lp-latest-list">
        {hasNews ? (
          newsEvents.map((newsItem) => (
            <li key={newsItem.id}>
              <img
                src={newsItem.image}
                alt={newsItem.title}
                className="lp-thumb-sm"
              />
              <div>
                <div className="lp-latest-title">{newsItem.title}</div>
                <div className="lp-small-date">{newsItem.date}</div>
              </div>
            </li>
          ))
        ) : (
          <li>
            <div>No latest news available.</div>
          </li>
        )}
      </ul>
    </div>
  );
};

export default LatestNews;
