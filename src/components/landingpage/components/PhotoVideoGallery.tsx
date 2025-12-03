import * as React from "react";
import { useState } from "react";
import { GalleryItemType } from "../../../utils/types";

interface PhotoVideoGalleryProps {
  items: GalleryItemType[];
}

const PhotoVideoGallery: React.FC<PhotoVideoGalleryProps> = ({ items }) => {
  const hasItems = Array.isArray(items) && items.length > 0;
  const ITEMS_PER_PAGE = 3;

  const [index, setIndex] = useState(0);

  const next = () => {
    if (!hasItems) return;
    setIndex((prev) =>
      prev + ITEMS_PER_PAGE >= items.length ? 0 : prev + ITEMS_PER_PAGE
    );
  };

  const prev = () => {
    if (!hasItems) return;
    setIndex((prev) =>
      prev - ITEMS_PER_PAGE < 0
        ? Math.floor((items.length - 1) / ITEMS_PER_PAGE) * ITEMS_PER_PAGE
        : prev - ITEMS_PER_PAGE
    );
  };

  const visibleItems = hasItems
    ? items.slice(index, index + ITEMS_PER_PAGE)
    : [];

  return (
    <div className="lp-card">
      <div className="lp-section-header">
        <h3>Photo Video Gallery</h3>
        <button className="lp-viewall">View all ➜</button>
      </div>
      
      <div className="lp-gallery-carousel-wrapper">
        <button className="lp-gallery-arrow" onClick={prev}>◀</button>

        <div className="lp-gallery">
          {visibleItems.length > 0 ? (
            visibleItems.map((item) =>
              item.imageType === "mp4" || item.imageType === "video" ? (
                <video
                  key={item.id}
                  src={item.url}
                  className="lp-gallery-img"
                  controls
                />
              ) : (
                <img
                  key={item.id}
                  src={item.url}
                  alt={item.description}
                  className="lp-gallery-img"
                />
              )
            )
          ) : (
            <div className="lp-gallery-empty">No gallery items available.</div>
          )}
        </div>

        <button className="lp-gallery-arrow" onClick={next}>▶</button>
      </div>
    </div>
  );
};

export default PhotoVideoGallery;
