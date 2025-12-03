
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { EventItem, EventsProps } from "../../../utils/types";

const Events: React.FC<EventsProps> = ({ mainEvent, sideEvents, onViewAll }) => {
  const navigate = useNavigate();

  // safe guards
  const hasMain = Boolean(mainEvent);
  const hasSides = Array.isArray(sideEvents) && sideEvents.length > 0;

  // ⭐ View All handler with fallback
  const handleViewAll = () => {
    if (onViewAll) onViewAll();
    else navigate("/listing/CorporateEvents");
  };

  // ⭐ Detail page navigation
  const openDetail = (id: any) => {
    if (!id) return;
    navigate(`/detail/CorporateEvents/${id}`);
  };

  return (
    <div className="lp-card lp-event-card">
      <div className="lp-section-header">
        <h3>Events</h3>

        <button className="lp-viewall" onClick={handleViewAll}>
          View all ➜
        </button>
      </div>

      <div className="lp-events-grid">
        {/* MAIN EVENT */}
        <div
          className="lp-event-main"
          style={{ cursor: hasMain ? "pointer" : "default" }}
          onClick={() => hasMain && openDetail((mainEvent as EventItem).id)}
        >
          {hasMain ? (
            <>
              <img
                src={(mainEvent as EventItem).image || ""}
                alt={(mainEvent as EventItem).alt || "event"}
                className="lp-event-main-img"
              />
              <h4 className="lp-event-title">{(mainEvent as EventItem).title}</h4>
              <p className="lp-event-sub">{(mainEvent as EventItem).description}</p>
              <div className="lp-small-date">{(mainEvent as EventItem).date}</div>
            </>
          ) : (
            <>
              <div className="lp-event-main-placeholder lp-event-main-img" />
              <h4 className="lp-event-title">No main event</h4>
              <p className="lp-event-sub">There are no main events to display.</p>
              <div className="lp-small-date">—</div>
            </>
          )}
        </div>

        {/* SIDE EVENTS */}
        <div className="lp-event-side">
          {hasSides ? (
            sideEvents.map((evt: EventItem) => (
              <div
                key={evt.id}
                className="lp-mini"
                onClick={() => openDetail(evt.id)}
                style={{ cursor: "pointer" }}
              >
                <h5>{evt.title}</h5>
                <div className="lp-small-date">{evt.date}</div>
              </div>
            ))
          ) : (
            <>
              <div className="lp-mini">
                <h5>No upcoming events</h5>
                <div className="lp-small-date">—</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
