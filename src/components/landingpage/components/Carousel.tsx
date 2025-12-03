import * as React from "react";
import { useState, useEffect } from "react";
import { HeroSlide } from "../../../utils/types";

interface CarouselProps {
  slides: HeroSlide[];
}

const Carousel: React.FC<CarouselProps> = ({ slides }) => {
  const [idx, setIdx] = useState(0);

  // Reset index when new slides arrive
  useEffect(() => {
    setIdx(0);
  }, [slides]);

  if (!slides || slides.length === 0) return null;

  return (
    <div className="lp-card lp-carousel">
      <img
        src={slides[idx].image}
        alt="hero"
        className="lp-carousel-img"
      />

      <div className="lp-carousel-overlay">
        <div className="lp-carousel-left">
          <h1 className="lp-carousel-title">{slides[idx].title}</h1>
          <p className="lp-carousel-excerpt">{slides[idx].subtitle}</p>
        </div>

        <div className="lp-carousel-controls">
          <button
            className="lp-arrow-btn"
            onClick={() =>
              setIdx((idx - 1 + slides.length) % slides.length)
            }
          >
            Prev
          </button>

          <button
            className="lp-arrow-btn"
            onClick={() =>
              setIdx((idx + 1) % slides.length)
            }
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Carousel;
