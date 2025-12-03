//type nav

export interface App {
  icon: React.ReactElement;
  title: string;
  color: string;
  path?: string;
}



// Type definitions dashboard
export interface LeadershipMessageType {
  id: number;
  name: string;
  title: string;
  message: string;
  avatar: string;
}

export interface NewsEventType {
  id: string;
  type: 'Event' | 'News';
  title: string;
  description: string;
  date: string;
  image: string;
}

export interface NewJoinerType {
  id: string;
  name: string;
  position: string;
  avatar: string;
}

export interface EventItemType {
  id: string;
  date: string;
  month: string;
  title: string;
  description: string;
  location: string;
  fullDate: string;
}

export interface GalleryItemType {
  id: number;
  url?: string;
  imageType?: string;
  description: string;
}

export interface CorporateNewsType {
  mainEvent: NewsItem | null;
  sideEvents: NewsItem[];
}

export interface NewsItem {
  id: number;
  title: string;
  description: string;
  date: string;
  image: any; // Use 'any' since 'img12', 'img5', etc., are placeholders
  alt: string;
}

export interface EventItem {
  id: number;
  title: string;
  description: string;
  date: string;
  image: string;
  alt: string;
}

export interface JobOpeningType {
  id: string;
  title: string;
  experience: string;
  dateposted: string;
  location: string;
  description?: string;
}

export interface QuickLinkType {
  tooltip?: string;
  label: string;
  url: string;
}


export interface EventsProps {
  mainEvent: EventItem | null;
  sideEvents: EventItem[];
  onViewAll?: () => void;
}

export interface GalleryItemType {
  id: number;
  imageType?: string;
  url?: string;
  description: string;
}

export interface DiscussionBoardType {
  id: number;
  title: string;
  description: string;
  image: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  logo?: string;
}

export interface HRAnnouncementType {
  id: number;
  subtitle: string;
  description: string;
}

export interface RecognizedEmployeeType {
  id: number;
  name: string;
  position: string;
  department: string;
  recognition: string;
  avatar: string;
}

export interface WelcomeMessageType {
  id?: string;
  message: string;
  employeeName: string;
  employeeImage: string;
}

//listing 

export interface ListingNewsItemType {
  id: number;
  title: string;
  location?: string;
  designation?: string;
  department?: string;
  description: string;
  date?: string;
  image?: string;
}

export interface DetailViewPropsType {
  title?: string;
  date?: string;
  publishType?: string;
  heroImage?: string;
  content?: {
    heading: string;
    paragraphs: string[];
  }[];
}

export interface DetailViewPropsLeadershipMessageType {
  employeeName: string;
  message: string;
  image?: string;       // optional, in case there's no image
  designation?: string; // optional, in case designation is missing
  department?: string;
  date?: string;        // optional, in case date is not provided
  recognizedBy?: string;
  recognizedByDesignation?: string;
  recognizedByCompanyName?: string;
}

