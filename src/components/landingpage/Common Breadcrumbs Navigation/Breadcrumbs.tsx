import * as React from "react";
import { useEffect, useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { spContext } from "../../../App";
import "./Breadcrumbs.css";
import { HomeOutlined } from "@ant-design/icons";
import { getRecognizedEmployeesById } from "../../../services/service";

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const { sp } = useContext(spContext);
  const [lastTitle, setLastTitle] = useState<string | null>(null);

  // Get path
  const fullPath = location.pathname || "";
  const pathnames = fullPath.split("/").filter(Boolean);

  const splitCamelCase = (text: string) => {
    return text
      .replace(/([a-z])([A-Z])/g, "$1 $2") // add space before capital letter
      .replace(/[-$%@!#&^*()+={}[\]|\\:;"'<>,.?/`~]/g, " ") // replace special chars with space
      .replace(/\s+/g, " ") // collapse multiple spaces
      .trim();
  };

  const formatLabel = (text: string) => {
    const split = splitCamelCase(decodeURIComponent(text));
    let formatted = split.replace(/\b\w/g, (char) => char.toUpperCase());

    // Fix known edge cases
    if (formatted === "Latest News And Events" || formatted === "Latest News Events") {
      formatted = "Latest News and Events";
    }
    if (formatted === "HRAnnouncements" || formatted==="Hr Announcement") {
      formatted = "HR Announcements";
    }
    if (formatted === "Recogonized Employee") {
      formatted = "Recognized Employee";
    }
    if (formatted === "Business Units" || formatted === "Bu Heads") {
      formatted = "Business Units";
    }
    if (formatted === "Carousel Data") {
      formatted = "Media Gallery";
    }

    return formatted;
  };


  // Truncate long text for mobile display
  const truncateText = (text: string) => {
    const isDesktop = window.innerWidth >= 1024; // Desktop check
    const maxLength = isDesktop ? 200 : 20;

    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };


  const filteredPathnames = pathnames.filter(
    (segment) =>
      segment.toLowerCase() !== "list" &&
      segment.toLowerCase() !== "detail"
  );

  const shouldShowBreadcrumbs =
    filteredPathnames.length > 0 &&
    !(
      filteredPathnames.length === 1 &&
      ["list", "detail"].includes(filteredPathnames[0].toLowerCase())
    );

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const lastSegment = filteredPathnames[filteredPathnames.length - 1];

        if (lastSegment && /^\d+$/.test(lastSegment)) {
          // Detect raw list name segment
          const adminIndex = filteredPathnames.indexOf("admin");
          const listNameSegment =
            adminIndex !== -1
              ? filteredPathnames[adminIndex + 1]
              : filteredPathnames[0];

          let rawListName = decodeURIComponent(listNameSegment);
          let titleValue: string | null = null;

          if (rawListName === "UpcomingEvents") {
            // ✅ Try fetching from CorporateEvents
            try {
              const corpItem = await sp.web.lists
                .getByTitle("CorporateEvents")
                .items.getById(Number(lastSegment))
                .select("Title")();

              if (corpItem?.Title) {
                titleValue = corpItem.Title;
              }
            } catch {
              // ignore if not found
            }

            // ✅ Fallback to LatestNewsAndEvents
            if (!titleValue) {
              try {
                const newsItem = await sp.web.lists
                  .getByTitle("LatestNewsAndEvents")
                  .items.getById(Number(lastSegment))
                  .select("Title")();

                titleValue = newsItem?.Title || null;
              } catch {
                titleValue = null;
              }
            }
          } else if (rawListName === "RecogonizedEmployee") {
            // ✅ Special case
            const item = await getRecognizedEmployeesById(
              sp,
              rawListName,
              Number(lastSegment)
            );
            titleValue = item?.EmployeeName || null;
          } else {
            // ✅ Default
            const item = await sp.web.lists
              .getByTitle(rawListName)
              .items.getById(Number(lastSegment))
              .select("Title")();
            titleValue = item?.Title || null;
          }

          setLastTitle(titleValue ? truncateText(titleValue) : null);
        } else {
          setLastTitle(null);
        }
      } catch (err) {
        console.error("Error fetching breadcrumb title:", err);
        setLastTitle(null);
      }
    };
    fetchTitle();
  }, [filteredPathnames, sp]);



  if (!shouldShowBreadcrumbs) return null;

  return (
    <nav className="breadcrumb-nav">
      <ol>
        <li>
          <Link className="breadcrumb-link" to="/" title="Home">
            <HomeOutlined />
          </Link>
        </li>
        {filteredPathnames.map((segment, index) => {
          const isLast = index === filteredPathnames.length - 1;
          const adminIndex = filteredPathnames.indexOf("admin");
          const listNameIndex = adminIndex !== -1 ? adminIndex + 1 : 0;

          let to;
          if (filteredPathnames[0].toLowerCase() === "admin") {
            to = `/admin/${filteredPathnames.slice(1, index + 1).join("/")}`;
          } else {
            to = `/list/${filteredPathnames.slice(0, index + 1).join("/")}`;
          }

          let label;
          let fullLabel; // For title attribute
          if (isLast) {
            fullLabel = lastTitle
              ? decodeURIComponent(lastTitle)
              : formatLabel(segment);
            label = truncateText(fullLabel);
          } else if (index === listNameIndex) {
            fullLabel = formatLabel(segment);
            label = truncateText(fullLabel);
          } else {
            fullLabel = formatLabel(segment);
            label = truncateText(fullLabel);
          }

          return (
            <li key={to}>
              <span className="breadcrumb-separator">&gt;</span>
              {isLast ? (
                <span className="breadcrumb-current" title={fullLabel}>
                  {label}
                </span>
              ) : (
                <Link className="breadcrumb-link" to={to} title={fullLabel}>
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;