import * as React from 'react';
import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";

import Carousel from "./components/Carousel";
import CorporateNews from "./components/CorporateNews";
import Events from "./components/Events";
import LatestNews from "./components/LatestNews";
import NewJoiners from "./components/NewJoiners";
import PhotoVideoGallery from "./components/PhotoVideoGallery";
import LeadershipMessage from "./components/LeadershipMessage";
import HrAnnouncements from "./components/HrAnnouncements";
import WelcomeOnboard from "./components/WelcomeOnboard";
import RecognizedEmployees from "./components/RecognizedEmployees";
import QuickLinks from "./components/QuickLinks";
import JobOpenings from "./components/JobOpenings";

import {
  getCarousalData,
  getCorporateEventsData,
  getCorporateNews,
  getDocumentsFromLibraryAsync,
  getHRAnnouncements,
  getJobOpeningsData,
  getNewgetOnboardEmployee,
  getNewJoiners,
  getNewsEvents,
  getQuickLinksData,
  getRecognizedEmployees,
} from "../../services/service";

import {
  CorporateNewsType,
  EventItem,
  GalleryItemType,
  HeroSlide,
  HRAnnouncementType,
  JobOpeningType,
  LeadershipMessageType,
  NewJoinerType,
  NewsEventType,
  QuickLinkType,
  RecognizedEmployeeType,
  WelcomeMessageType
} from "../../utils/types";
import { spContext } from "../../App";
import { defaultTenantUrl } from "../../utils/constant";
import "./landingpagefull.css";
import { getLeadershipMessagesItems } 
from "../../services/adminServices/LeadershipMessagesService/LeadershipMessagesService";

const LandingPageFull: React.FC = () => {
  const { sp } = useContext(spContext);
  const navigate = useNavigate();

  const [carouselData, setCarouselData] = useState<HeroSlide[]>([]);
  const [corporateNewsData, setCorporateNewsData] = useState<CorporateNewsType>({
    mainEvent: null,
    sideEvents: []
  });
  const [corporateEventsData, setCorporateEventsData] = useState<{
    mainEvent: EventItem | null;
    sideEvents: EventItem[];
  }>({ mainEvent: null, sideEvents: [] });

  const [latestNewsData, setLatestNewsData] = useState<NewsEventType[]>([]);
  const [newJoinersData, setNewJoinersData] = useState<NewJoinerType[]>([]);
  const [galleryData, setGalleryData] = useState<GalleryItemType[]>([]);
  const [leadershipData, setLeadershipData] = useState<LeadershipMessageType[]>([]);
  const [hrData, setHrData] = useState<HRAnnouncementType[]>([]);
  const [welcomeData, setWelcomeData] = useState<WelcomeMessageType[]>([]);
  const [recognizedEmployees, setRecognizedEmployees] = useState<RecognizedEmployeeType[]>([]);
  const [quickLinks, setQuickLinks] = useState<QuickLinkType[]>([]);
  const [jobOpeningData, setJobOpeningData] = useState<JobOpeningType[]>([]);

  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!leftRef.current || !rightRef.current) return;

    const updateHeight = () => {
      if (window.innerWidth >= 1024) {
        rightRef.current!.style.height = "auto";  // reset first
        rightRef.current!.style.height = `${leftRef.current!.offsetHeight}px`;
      } else {
        rightRef.current!.style.height = "auto";
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, [carouselData, leadershipData, hrData, welcomeData]);


  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const carousal = (await getCarousalData(sp, "MediaGallery")) ?? [];

      const mappedCarousel: HeroSlide[] = carousal
        .filter((item: any) => item.Status === "publish") // fetch only published items
        .map((item: any) => ({
          id: String(item.Id),
          image: item.ThumbnailURL,
          title: item.Title,
          subtitle: item.Description
        }));

      setCarouselData(mappedCarousel);



      const corpNews = (await getCorporateNews(sp, "CorporateNews")) ?? [];
      const mappedNews = corpNews.map((n: any) => ({
        id: n.Id,
        title: n.Title,
        description: n.Description,
        image: n.Image,
        date: n.Date,
        alt: n.Title
      }));

      setCorporateNewsData({
        mainEvent: mappedNews[0] ?? null,
        sideEvents: mappedNews.slice(1),
      });

      const corpEvents = await getCorporateEventsData(sp, "CorporateEvents");
      const mappedEvents = corpEvents.map((e: any) => ({
        id: e.Id,
        title: e.Title,
        description: e.Description,
        image: e.Image,
        date: e.Date,
        alt: e.Title
      }));

      setCorporateEventsData({
        mainEvent: mappedEvents[0] ?? null,
        sideEvents: mappedEvents.slice(1)
      });

      const newsEvents = await getNewsEvents(sp, "LatestNewsAndEvents");
      setLatestNewsData(newsEvents);

      const newJoiners = await getNewJoiners(sp, "NewJoinee");
      setNewJoinersData(
        newJoiners.map((nj: any) => ({
          id: String(nj.UserID),
          name: nj.EmployeeName,
          position: nj.Designation,
          avatar: nj.UserImage
        }))
      );

      const files = await getDocumentsFromLibraryAsync(sp, "VideoGalleryLibrary");
      setGalleryData(
        files.map((doc: any) => ({
          id: doc.Id,
          url: `${defaultTenantUrl}${doc.File.ServerRelativeUrl}`,
          imageType: doc.FileType,
          description: doc.FileLeafRef
        }))
      );

      const leadershipItems = (await getLeadershipMessagesItems(sp, "LeadershipMessage")) ?? [];

      setLeadershipData(
        leadershipItems
          .filter((item: any) => item.Status === "publish")
          .map((item: any) => ({
            id: item.ID,
            message: item.Message,
            avatar: item.UserImage,
            name: item.Title,          // ✅ FIXED
            title: item.Designation,   // correct
          }))
      );

      console.log("RAW leadershipItems:", leadershipItems);

      const hrItems = (await getHRAnnouncements(sp, "HRAnnouncements")) ?? [];

      const mappedHR = hrItems
        .filter((item: any) => item.Status === "publish")
        .map((item: any) => ({
          id: item.ID,
          subtitle: item.Title,
          description: item.Description,
          date: item.Date,
          status: item.Status
        }));

      setHrData(mappedHR);


      setQuickLinks((await getQuickLinksData(sp, "QuickLinks")) ?? []);
      setJobOpeningData((await getJobOpeningsData(sp, "JobOpenings")) ?? []);

      const onboardItems = (await getNewgetOnboardEmployee(sp, "EmployeeOnboard")) ?? [];

      const mappedOnboard = onboardItems
        .filter(i => i.Status === "publish")
        .map(i => ({
          id: i.EmployeeID,
          message: i.Message,
          employeeName: i.EmployeeName,
          employeeImage: i.Image,
        }));

      setWelcomeData(mappedOnboard);


      const recognized = (await getRecognizedEmployees(sp, "RecogonizedEmployee")) ?? [];
      setRecognizedEmployees(
        recognized.map((item: any) => ({
          id: item.ID,
          name: item.EmployeeName,
          position: item.Designation,
          department: item.Department,
          recognition: item.RecogonitionDescription,
          avatar: item.Image
        }))
      );

    } catch (err) {
      console.error("Error in LandingPageFull:", err);
    }
  };

  return (
    <div className="lp-wrapper">
      <div className="lp-left" ref={leftRef}>
        <Carousel slides={carouselData} />

        <CorporateNews
          mainNews={corporateNewsData.mainEvent}
          sideNews={corporateNewsData.sideEvents}
          onViewAll={() => navigate("/listing/CorporateNews")}
        />

        <Events
          mainEvent={corporateEventsData.mainEvent}
          sideEvents={corporateEventsData.sideEvents}
        />

        <div className="lp-grid-2col">
          <LatestNews newsEvents={latestNewsData} />
          <NewJoiners newJoiners={newJoinersData} />
        </div>

        <PhotoVideoGallery items={galleryData} />
      </div>

      <div className="lp-right-scroll">
        <aside className="lp-right" ref={rightRef}>
          <LeadershipMessage data={leadershipData} />
          <HrAnnouncements data={hrData} />
          <WelcomeOnboard data={welcomeData} />
          <RecognizedEmployees data={recognizedEmployees} />
          <QuickLinks quickLinks={quickLinks} />
          <JobOpenings jobOpenings={jobOpeningData} />
        </aside>
      </div>
    </div>
  );
};

export default LandingPageFull;
