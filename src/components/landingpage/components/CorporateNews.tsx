import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "antd";
import { RightOutlined } from "@ant-design/icons";
import CorpThumb from "../assets/Gurunath Kanathur 1.png";
import { NewsItem } from "../../../utils/types";
import { dateFormat } from "../../../utils/utils";

interface CorporateNewsProps {
  mainNews: NewsItem | null;
  sideNews: NewsItem[];
  onViewAll?: () => void; // optional
}

const CorporateNews: React.FC<CorporateNewsProps> = ({ mainNews, sideNews, onViewAll }) => {
  const navigate = useNavigate();

  const handleClick = (id: any) => {
    navigate(`/detail/CorporateNews/${id}`);
  };

  const handleViewAllNews = () => {
    // 🔥 Updated logic — fallback navigation added
    if (onViewAll) onViewAll();
    else navigate("/listing/CorporateNews");
  };

  return (
    <div className="lp-card lp-corporate-card">
      <div className="lp-section-header">
        <h3>Corporate News</h3>

        <button className="lp-viewall" onClick={handleViewAllNews}>
          View all <RightOutlined />
        </button>
      </div>

      <div className="lp-corporate-grid">

        <div className="lp-corp-main" onClick={() => handleClick(mainNews?.id)}>
          <img src={mainNews?.image || CorpThumb} alt="corp" className="lp-corp-main-img" />

          <Tooltip title={mainNews?.title}>
            <h4 className="lp-corp-title">{mainNews?.title}</h4>
          </Tooltip>

          <Tooltip title={mainNews?.description}>
            <p className="lp-corp-sub">{mainNews?.description}</p>
          </Tooltip>

          <div className="lp-small-date">
            {dateFormat(mainNews?.date || "")}
          </div>
        </div>

        <div className="lp-corp-side">
          {sideNews.map((news) => (
            <div
              key={news.id}
              className="lp-mini"
              onClick={() => handleClick(news.id)}
              style={{ cursor: "pointer" }}
            >
              <Tooltip title={news.title}>
                <h5>{news.title}</h5>
              </Tooltip>

              <div className="lp-small-date">{dateFormat(news.date)}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default CorporateNews;
