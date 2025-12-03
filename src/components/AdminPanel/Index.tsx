import * as React from 'react';
import {
  PictureOutlined,
  FileTextOutlined,
  CalendarOutlined,
  // MessageOutlined,
  VideoCameraOutlined,
  ThunderboltOutlined,
  UserAddOutlined,
  TrophyOutlined,
  SmileOutlined,
  NotificationOutlined,
  TeamOutlined,
  SolutionOutlined,
  CrownOutlined,
  LinkOutlined
} from '@ant-design/icons';
import './AdminPanel.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface AdminPanelProps { }

interface PanelItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface CustomCardProps {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
  isActive?: boolean;
}

const CustomCard: React.FC<CustomCardProps> = ({
  className = '',
  onClick,
  children,
  isActive = false
}) => {
  return (
    <div
      className={`admin-custom-card ${className} ${isActive ? 'admin-active' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const AdminPanel: React.FC<AdminPanelProps> = () => {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePanelClick = (panelId: string) => {
    setActivePanel(panelId);
    console.log(`Navigating to: ${panelId}`);
    navigate(`/${panelId}`)
  };

  const panelItems: PanelItem[] = [
    {
      id: 'carousal-data',
      title: 'Media Gallery',
      description: 'Upload and manage images or banners for the homepage carousel.',
      icon: <PictureOutlined style={{ color: 'black' }}/>,
      onClick: () => handlePanelClick('admin/carousel-data')
    },
    {
      id: 'corporate-news',
      title: 'Corporate News',
      description: 'Publish and maintain news articles about company updates.',
      icon: <FileTextOutlined style={{ color: 'black' }}/>,
      onClick: () => handlePanelClick('admin/corporate-news')
    },
    {
      id: 'events',
      title: 'Events',
      description: 'Highlight the most recent company events updates.',
      icon: <CalendarOutlined style={{ color: 'black' }}/>,
      onClick: () => handlePanelClick('admin/corporate-events')
    },
    // {
    //   id: 'description-board',
    //   title: 'Description Board',
    //   description: 'Display important notices or messages on the description board.',
    //   icon: <MessageOutlined style={{ color: 'black' }}/>,
    //   onClick: () => handlePanelClick('admin/description-board')
    // },
    {
      id: 'leadership-messages',
      title: 'Leadership Messages',
      description: 'Post messages and updates from company leadership.',
      icon: <CrownOutlined style={{ color: 'black' }}/>,
      onClick: () => handlePanelClick('admin/leadership-messages')
    },
    {
      id: 'photo-video-gallery',
      title: 'Photo Video Gallery',
      description: 'Organize and display corporate photos and video content.',
      icon: <VideoCameraOutlined style={{ color: 'black' }}/>,
      onClick: () => handlePanelClick('admin/photo-video-gallery')
    },
    {
      id: 'latest-news-events',
      title: 'Latest News & Events',
      description: 'Create, schedule, and manage latest and upcoming news and events.',
      icon: <ThunderboltOutlined style={{ color: 'black' }}/>,
      onClick: () => handlePanelClick('admin/latest-news-events')
    },
    {
      id: 'new-joiners',
      title: 'New Joiners',
      description: 'Welcome and showcase newly joined team members.',
      icon: <UserAddOutlined style={{ color: 'black' }}/>,
      onClick: () => handlePanelClick('admin/new-joiners')
    },
    {
      id: 'recognized-employee',
      title: 'Recognized Employee',
      description: 'Acknowledge employees with notable achievements.',
      icon: <TrophyOutlined style={{ color: 'black' }}/>,
      onClick: () => handlePanelClick('admin/recognized-employee')
    },
    {
      id: 'welcome-data',
      title: 'Welcome Data',
      description: 'Manage welcome content for employees and visitors.',
      icon: <SmileOutlined style={{ color: 'black' }}/>,
      onClick: () => handlePanelClick('admin/welcome-data')
    },
    {
      id: 'hr-announcement',
      title: 'HR Announcements',
      description: 'Share important announcements from the HR department.',
      icon: <NotificationOutlined style={{ color: 'black' }}/>,
      onClick: () => handlePanelClick('admin/hr-announcement')
    },
    {
      id: 'employee-directory-management',
      title: 'Employee Directory Management',
      description: 'Maintain employee profiles and contact details.',
      icon: <TeamOutlined style={{ color: 'black' }}/>,
      onClick: () => handlePanelClick('admin/employee-directory')
    },
    {
      id: 'job-openings-management',
      title: 'Job Openings Management',
      description: 'List and manage current job openings.',
      icon: <SolutionOutlined style={{ color: 'black' }}/>,
      onClick: () => handlePanelClick('admin/job-openings')
    },
    {
      id: 'bu-heads-management',
      title: 'BU Heads Management',
      description: 'Manage profiles of Business Unit Heads.',
      icon: <CrownOutlined style={{ color: 'black' }}/>,
      onClick: () => handlePanelClick('admin/bu-heads')
    },
    {
      id: 'quick-links-management',
      title: 'Quick Links Management',
      description: 'Add, edit, or remove quick access links.',
      icon: <LinkOutlined style={{ color: 'black' }}/>,
      onClick: () => handlePanelClick('admin/quick-links')
    }
  ];

  return (
    <div className="admin-admin-panel-container">
      <div className="admin-admin-panel-header">
        <h1>Admin Panel</h1>
      </div>

      <div className="admin-admin-panel-content">
        <div className="admin-cards-grid">
          {panelItems.map((item) => (
            <CustomCard
              key={item.id}
              className="admin-admin-panel-card"
              onClick={item.onClick}
              isActive={activePanel === item.id}
            >
              <div className="admin-card-content">
                <div className="admin-card-icon">
                  {item.icon}
                </div>
                <div className="admin-card-info">
                  <h3 className="admin-card-title">{item.title}</h3>
                  <p className="admin-card-description">{item.description}</p>
                </div>
              </div>
            </CustomCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

