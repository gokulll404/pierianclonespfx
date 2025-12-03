import * as React from "react";
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './DetailPage.css';
import DetailViewComponent from '../../BaseWidgets/DetailViewComponent/Index';
import { DetailViewPropsLeadershipMessageType, DetailViewPropsType } from '../../../utils/types';
import { spContext } from '../../../App';
import { getDetailViewData, getHRAnnouncementsById, getJobOpeningById, getLeadershipMessagesById, getNewsEventsById, getRecognizedEmployeesById, getUpcomingEventById } from '../../../services/service';
import JobOpeningsDetail from '../../BaseWidgets/DetailViewComponent/JobOpeningDetailView/Index';

// Job Opening interface
interface JobOpening {
  id: string;
  title: string;
  experience: string;
  dateposted: string;
  location: string;
  BU: string;
  JDAttachments: string;
  description?: string;
}

const DetailPage: React.FC = () => {
  const { sp } = useContext(spContext);
  const { listName, id } = useParams<{ listName: string; id: string }>();
  const [detailData, setDetailData] = useState<DetailViewPropsType | null>(null);
  const [jobData, setJobData] = useState<JobOpening | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!listName || !id) return;

      try {
        // Handle JobOpenings specifically
        if (listName === 'JobOpenings') {
          const item = await getJobOpeningById(sp, listName, Number(id));
          if (!item) return;

          // Convert HTML body to plain text for description
          let description = 'No description available.';
          if (item.JobDescription) {
            const htmlContent = item.JobDescription || '';
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            description = doc.body.innerText || description;
          }

          const mappedJobData: JobOpening = {
            id: id,
            title: item.jobTitle || 'Job Opening',
            experience: item.experience || 'Not specified',
            dateposted: item.DatePosted || item.Created || new Date().toISOString(),
            location: item.location || 'Not specified',
            BU: item.BU,
            JDAttachments: item.JDAttachments,
            description: description,
          };

          setJobData(mappedJobData);

        } else if (listName === 'LeadershipMessage') {
          const item = await getLeadershipMessagesById(sp, listName, Number(id));
          if (!item) return;

          let plainText = 'No content available.';
          if (item.Body) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(item.Body, 'text/html');
            plainText = doc.body.innerText || plainText;
          }

          const mapped: DetailViewPropsLeadershipMessageType = {
            employeeName: item.Title,
            message: item.Message,
            image: item.UserImage,
            designation: item.Designation,
          };

          setDetailData(mapped);

        } else if (listName === 'RecogonizedEmployee') {
          const item = await getRecognizedEmployeesById(sp, listName, Number(id));
          if (!item) return;

          let plainText = 'No content available.';
          if (item.RecogonitionDescription) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(item.RecogonitionDescription, 'text/html');
            plainText = doc.body.innerText || plainText;
          }

          const mapped: DetailViewPropsLeadershipMessageType = {
            employeeName: item.EmployeeName,
            message: item.RecogonitionDescription,
            date: item.RecogonitionDate,
            image: item.Image,
            designation: item.Designation,
            department: item.Department,
            recognizedBy: item.RecognizedBy || '',
            recognizedByDesignation: item.RecognizedByDesignation || '',
            recognizedByCompanyName: item.RecognizedByCompanyName || '',
          };

          setDetailData(mapped);

        } else if (listName === 'HRAnnouncements') {
          const item = await getHRAnnouncementsById(sp, listName, Number(id));

          if (!item) return;

          let plainText = 'No content available.';
          if (item.Body) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(item.Body, 'text/html');
            plainText = doc.body.innerText || plainText;
          }

          const mapped: DetailViewPropsLeadershipMessageType = {
            employeeName: item.Title,
            date: item.Date,
            message: item.Description
          };

          setDetailData(mapped);

        } else if (listName === 'UpcomingEvents') {
          const item = await getUpcomingEventById(sp, 'CorporateEvents', 'LatestNewsAndEvents', Number(id));
          if (!item) return;

          let plainText = 'No content available.';
          if (item.Body) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(item.Body, 'text/html');
            plainText = doc.body.innerText || plainText;
          }

          const mapped: DetailViewPropsType = {
            title: item.Title,
            date: item.Date,
            heroImage: item.Image || '',
            content: [
              {
                heading: item.Description || 'No Details',
                paragraphs: [plainText],
              },
            ],
          };

          setDetailData(mapped);

        } else if (listName === 'LatestNewsAndEvents') {
          const item = await getNewsEventsById(sp, 'LatestNewsAndEvents', Number(id));
          if (!item) return;

          let plainText = 'No content available.';
          if (item.Body) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(item.Body, 'text/html');
            plainText = doc.body.innerText || plainText;
          }

          const mapped: DetailViewPropsType = {
            title: item.Title,
            date: item.Date,
            publishType: item.PublishType,
            heroImage: item.Image || '',
            content: [
              {
                heading: item.Description || 'No Details',
                paragraphs: [plainText],
              },
            ],
          };

          setDetailData(mapped);

        } else {
          // Handle all other lists
          const item = await getDetailViewData(sp, listName, Number(id));
          if (!item) return;

          let plainText = 'No content available.';
          if (item.Body) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(item.Body, 'text/html');
            plainText = doc.body.innerText || plainText;
          }

          const mapped: DetailViewPropsType = {
            title: item.Title,
            date: item.Date,
            heroImage: item.Image || '',
            content: [
              {
                heading: item.Description || 'No Details',
                paragraphs: [plainText],
              },
            ],
          };

          setDetailData(mapped);
        }
      } catch (err) {
        console.error('Failed to load detail view data:', err);
      }
    };

    fetchDetail();
  }, [listName, id, sp]);

  // Render JobOpenings with specific component
  if (listName === 'JobOpenings' && jobData) {
    return (
      <div className="detail-page-container">
        <JobOpeningsDetail jobData={jobData} />
      </div>
    );
  }

  // Render other list types with existing DetailViewComponent
  return (
    <div className="detail-page-container">
      {detailData && listName && id && (
        <DetailViewComponent
          DetailData={detailData}
          Title={detailData.title || ''}
          ListName={listName}
          id={id}
        />
      )}
    </div>
  );
};

export default DetailPage;
