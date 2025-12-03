import * as React from "react";
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './ListingPage.css';
import ListingComponent from '../../BaseWidgets/ListingComponent/Index';
import { ListingNewsItemType } from '../../../utils/types';
import { spContext } from '../../../App';
import { getDocumentsFromLibraryAsync, getHRAnnouncements, getJobOpeningsData, getLeadershipMessages, getListingData, getRecognizedEmployees, getUpcomingEvents } from '../../../services/service';
import { defaultTenantUrl } from '../../../utils/constant';
import { JobOpeningsListingIcon } from '../../../utils/customSettings';

const ListingPage: React.FC = () => {
    const { sp } = useContext(spContext);
    const { listName } = useParams<{ listName: string }>();
    const [newsItems, setNewsItems] = useState<ListingNewsItemType[]>([]);

    const splitCamelCase = (text: string) => {
        return text
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/[-$%@!#&^*()+={}[\]|\\:;"'<>,.?/`~]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!listName) return;

            try {
                let items;
                if (listName === "VideoGalleryLibrary") {
                    items = await getDocumentsFromLibraryAsync(sp, listName);
                    console.log(items, "VideoGalleryLibrary");
                    if (items) {
                        const mappedItems: any[] = items.map((item: any) => ({
                            id: item.Id,
                            title: item.Title,
                            description: item.FileDescription,
                            fileType: item.FileType,
                            url: `${defaultTenantUrl}${item?.File?.ServerRelativeUrl}`,
                        }));
                        setNewsItems(mappedItems);
                    }
                } else if (listName === "JobOpenings") {
                    items = await getJobOpeningsData(sp, listName);
                    if (items) {
                        const mappedItems: ListingNewsItemType[] = items.map((item: any) => ({
                            id: item.Id,
                            title: item.jobTitle,
                            description: item.experience,
                            date: item.DatePosted,
                            location: item.location,
                            image: JobOpeningsListingIcon
                        }));
                        setNewsItems(mappedItems);
                    }
                } else if (listName === "LeadershipMessage") {
                    items = await getLeadershipMessages(sp, listName);
                    if (items) {
                        const mappedItems: ListingNewsItemType[] = items.map((item: any) => ({
                            id: item.Id,
                            title: item.Title,
                            description: item.Message,
                            date: item.DatePosted || null,
                            image: item.UserImage
                        }));
                        setNewsItems(mappedItems);
                    }
                } else if (listName === "RecogonizedEmployee") {
                    items = await getRecognizedEmployees(sp, listName);
                    if (items) {
                        const mappedItems: ListingNewsItemType[] = items.map((item: any) => ({
                            id: item.ID,
                            title: item.EmployeeName,
                            description: item.RecogonitionDescription,
                            department: item.Department,
                            designation: item.Designation,
                            date: item.RecogonitionDate || null,
                            image: item.Image
                        }));
                        setNewsItems(mappedItems);
                    }
                } else if (listName === "HRAnnouncements") {
                    items = await getHRAnnouncements(sp, listName);
                    if (items) {
                        const mappedItems: ListingNewsItemType[] = items.map((item: any) => ({
                            id: item.ID,
                            title: item.Title,
                            date: item.Date,
                            description: item.Description,

                        }));
                        setNewsItems(mappedItems);
                    }
                } else if (listName === "UpcomingEvents") {
                    items = await getUpcomingEvents(sp, "CorporateEvents", "LatestNewsAndEvents", true);


                    if (items) {
                        const mappedItems: ListingNewsItemType[] = items.map((item: any) => ({
                            id: item.Id,
                            title: item.Title,
                            description: item.Description,
                            date: item.Date,
                            image: item.Image
                        }));
                        setNewsItems(mappedItems);
                    }
                }
                else {
                    items = await getListingData(sp, listName);
                    if (items) {
                        const mappedItems: ListingNewsItemType[] = items.map((item: any) => ({
                            id: item.Id,
                            title: (item.Title),
                            description: item.Description,
                            date: item.Date,
                            image: item.Image
                        }));
                        setNewsItems(mappedItems);
                    }
                    console.log(newsItems);

                }
            } catch (error) {
                console.error("Failed to load list data:", error);
            }
        };

        fetchData();
    }, [listName, sp]);

    return (
        <div className='listing-page-outer-div'>
            {listName && (
                newsItems.length > 0 ? (
                    <ListingComponent
                        newsItems={newsItems}
                        Title={splitCamelCase(listName)}
                        ListName={listName}
                    />
                ) : (
                    <div className="upcoming-event-empty">No data</div>
                )
            )}
        </div>
    );
};

export default ListingPage;
