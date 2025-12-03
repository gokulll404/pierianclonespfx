import * as React from 'react';
import  { useState } from 'react';
import './ListingComponent.css';
import { useNavigate } from 'react-router-dom';
import { dateFormat } from '../../../utils/utils';
import { Input, Pagination } from 'antd';

interface ListingComponentProps {
    newsItems: any[];
    Title: string;
    ListName: string;
}

const ListingComponent: React.FC<ListingComponentProps> = ({ newsItems, Title, ListName }) => {
    const navigate = useNavigate();

    const [isViewerOpen, setViewerOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 4; // number of items per page

    const handleClick = (id: any) => {
        navigate(`/detail/${ListName}/${id}`);
    };

    const openViewer = (item: any) => {
        setSelectedMedia(item);
        setViewerOpen(true);
    };

    const closeViewer = () => {
        setViewerOpen(false);
        setSelectedMedia(null);
    };

    // filter items
    const filteredItems = newsItems.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // paginate items
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);

    const truncate = (text: string, maxLength: number) => {
        if (!text) return "";
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    const formatTitle = (title: string) => {
        if (!title) return "";

        if (title === "Latest News And Events") return "Latest News and Events";
        if (title === "HRAnnouncements") return "HR Announcements";
        if (title === "Recogonized Employee") return "Recognized Employee";

        return title;
    };

    const { Search } = Input;

    return (
        <>
            <div className="listing-container">
                <header className="listing-header">
                    <h1>{formatTitle(Title)}</h1>
                    <div className="listing-search-bar">
                        <Search
                            placeholder="Search..."
                            allowClear
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // reset to first page on search
                            }}
                            style={{ width: 400, marginBottom: 20 }}
                        />
                    </div>
                </header>

                {ListName === "VideoGalleryLibrary" ? (
                    <div className="news-list">
                        {paginatedItems.map((item) => (
                            <div key={item.id} className="news-item" onClick={() => openViewer(item)}>
                                <div className="news-image">
                                    {item.fileType === "video" && item.url ? (
                                        <video className="gallery-video" muted>
                                            <source src={item.url} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <img src={item.url} alt={item.description} />
                                    )}
                                </div>
                                <div className="news-content">
                                    <h3 className="news-title">{item.fileType === 'video' ? 'Video' : 'Image'}</h3>
                                    <p className="news-description">{truncate(item.description, 200)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="news-list">
                        {paginatedItems.map((item) => (
                            <div key={item.id} className="news-item" onClick={() => handleClick(item.id)}>
                                {item.image && <div className="news-image">
                                    <img src={item.image} alt={item.title} />
                                </div>}
                                <div className="news-content">
                                    <h3 className="news-title">{item.title} {item.designation && <>| {item.designation}</>} {item.location && <>| {item.location}</>}</h3>
                                    <p className="news-description">{truncate(item.description, 200)}</p>
                                    <div className="news-meta">
                                        {item.date && <span className="news-date">{dateFormat(item.date)}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {filteredItems.length > pageSize && (
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        margin: "30px 0",
                    }}>
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={filteredItems.length}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                        />
                    </div>
                )}
            </div>

            {/* Image/Video Viewer Modal */}
            {isViewerOpen && selectedMedia && (
                <div className="media-viewer-modal" onClick={closeViewer}>
                    <div className="media-viewer-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close-button" onClick={closeViewer}>x</span>
                        {selectedMedia.fileType === 'video' ? (
                            <video controls autoPlay className="viewer-video">
                                <source src={selectedMedia.url} type="video/mp4" />
                            </video>
                        ) : (
                            <img src={selectedMedia.url} alt={selectedMedia.description} className="viewer-image" />
                        )}
                        <p className="viewer-description">{selectedMedia.description}</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default ListingComponent;
