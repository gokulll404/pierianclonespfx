import * as React from 'react';
import { Tag } from 'antd';
import { spContext } from '../../../../App';
import UniversalDataManagement, { BaseDataItem, ColumnConfig, FieldConfig, ServiceConfig } from '../../BasicComponents/UniversalDataManagement/Index';
import {
  getLatestNewsAndEvents,
  addLatestNewsEvent,
  updateLatestNewsEvent,
  deleteLatestNewsEvent,
  uploadFileToPictureLibraryAsync,
  deleteFileFromDocumentLibrary
} from '../../../../services/adminServices/LatestNewsAndEventsService/LatestNewsAndEventsService';
import * as dayjs from 'dayjs';
import { dateFormat } from '../../../../utils/utils';

// Define the data interface
interface LatestNewsEventItem extends BaseDataItem {
  id: number;
  image: string;
  title: string;
  description: string;
  body: string;
  date: string;
  location: string;
  publishType: string;
  status: 'publish' | 'unpublish' | 'draft';
}

// Image validation function
const validateImageDimensions = (file: File | null | undefined): Promise<string | null> => {
    // Basic check for presence of file
    if (!file) {
        return Promise.resolve('Image is required');
    }
    
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            const { width, height } = img;

            // Allowed resolution range
            const minWidth = 800, maxWidth = 1280;
            const minHeight = 420, maxHeight = 1200;

            if (width < minWidth || width > maxWidth || height < minHeight || height > maxHeight) {
                resolve(`Image resolution must be between ${minWidth}×${minHeight} and ${maxWidth}×${maxHeight}. Current: ${width}×${height}`);
            } else {
                resolve(null); // ✅ No error
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve('Invalid image file');
        };

        img.src = url;
    });
};


// Title validation function
const validateTitle = (value: any): string | null => {
    if (!value || typeof value !== 'string') {
        return 'Title is required';
    }
    
    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
        return 'Title cannot be empty';
    }
    
    if (trimmedValue.length > 60) {
        return `Title must not exceed 60 characters. Current: ${trimmedValue.length} characters`;
    }
    
    return null;
};

// Description validation function
const validateSubtext = (value: any): string | null => {
    if (!value || typeof value !== 'string') {
        return 'Subtext is required';
    }
    
    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
        return 'Subtext cannot be empty';
    }
    
    if (trimmedValue.length > 350) {
        return `Subtext must not exceed 350 characters. Current: ${trimmedValue.length} characters`;
    }
    
    return null;
};

// Body validation function
const validateParagraph = (value: any): string | null => {
    if (!value || typeof value !== 'string') {
        return 'Description is required';
    }
    
    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
        return 'Description cannot be empty';
    }
    
    // if (trimmedValue.length > 550) {
    //     return `Paragraph must not exceed 550 characters. Current: ${trimmedValue.length} characters`;
    // }
    
    return null;
};

// Define column configuration
const columns: ColumnConfig[] = [
  {
    key: 'image',
    title: 'Image',
    width: 80,
    render: (image: string) => (
      <img
        src={image}
        alt="event"
        className="image-universal-data-management"
      />
    ),
  },
  { key: 'title', title: 'News Title', width: 200, searchable: true },
  { key: 'description', title: 'Short Description', width: 180, searchable: true },
  { key: 'body', title: 'Description', width: 200 },
  { key: 'location', title: 'Location', width: 160 },
  { key: 'publishType', title: 'Publish Type', width: 160 },
  {
    key: 'date',
    title: 'Event/News Date',
    width: 120,
    render: (value: string) => dateFormat(value),
  },
  {
    key: 'status',
    title: 'Status',
    width: 100,
    render: (status: string) => {
      const color = status === 'publish' ? 'green' : status === 'unpublish' ? 'red' : 'orange';
      return <Tag color={color}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>;
    },
  }
];

// Define form field configuration
const fields: FieldConfig[] = [
  {
    key: 'image',
    label: 'Image (800×420 to 1280x1200)',
    type: 'file',
    accept: 'image/png,image/jpeg,image/jpg',
    required: true,
    validator: validateImageDimensions,
  },
  {
    key: 'title',
    label: 'Title',
    type: 'text',
    required: true,
    placeholder: 'Enter title (max 60 characters)',
    validator: validateTitle,
  },
  {
    key: 'description',
    label: 'Short Description',
    type: 'text',
    required: false,
    placeholder: 'Enter Short Description (max 350 characters)',
    validator: validateSubtext,
  },
  {
    key: 'body',
    label: 'Description',
    type: 'textarea',
    required: false,
    placeholder: 'Enter Description',
    rows: 4,
    validator: validateParagraph,
  },
  {
    key: 'location',
    label: 'Location',
    type: 'text',
    required: false,
    placeholder: 'Enter location',
  },
  {
    key: 'publishType',
    label: 'Publish Type',
    type: 'select',
    options: [{value:'News',label:'News'},{value:"Event",label:"Event"}],
    required: false,
    placeholder: 'Select publish type',
  },
  {
    key: 'date',
    label: 'Event/News Date',
    type: 'date',
    required: false,
    placeholder: 'Select date',
  },
  {
    key: 'status',
    label: 'Status',
    type: 'radio',
    required: true,
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'unpublish', label: 'Unpublish' },
      { value: 'publish', label: 'Publish' },
    ],
  }
];

// Define service configuration
const services: ServiceConfig<LatestNewsEventItem> = {
  fetchData: async (sp, listName) => {
    const items = await getLatestNewsAndEvents(sp, listName);
    return items ?? [];
  },
  addData: async (sp, listName, data) => {
    await addLatestNewsEvent(sp, listName, data);
  },
  updateData: async (sp, listName, id, data) => {
    await updateLatestNewsEvent(sp, listName, id, data);
  },
  deleteData: async (sp, listName, id) => {
    await deleteLatestNewsEvent(sp, listName, id);
  },
  uploadFile: async (sp, libraryName, fileInfo) => {
    const result = await uploadFileToPictureLibraryAsync(sp, libraryName, fileInfo);
    return result ?? "";
  },
  deleteFile: async (sp, fileUrl) => {
    return await deleteFileFromDocumentLibrary(sp, fileUrl);
  },
  mapResponseToData: (items: any[]): LatestNewsEventItem[] => {
    return items.map(item => ({
      id: item.ID,
      image: item.Image,
      title: item.Title,
      description: item.Description,
      body: item.Body,
      date: dateFormat(item.Date),
      location: item.Location,
      publishType: item.PublishType,
      status: item.Status || "draft"
    }));
  },
  mapFormDataToRequest: (formData: Partial<LatestNewsEventItem>) => ({
    Image: formData.image,
    Title: formData.title,
    Description: formData.description,
    Body: formData.body,
    Date: dayjs(formData.date).format('YYYY-MM-DD'),
    Location: formData.location,
    PublishType: formData.publishType,
    Status: formData.status || "draft"
  }),
};

// Optional custom validator (future use)
const validateStatus = (value: any): string | null => {
  return null;
};
fields.find(f => f.key === 'status')!.validator = validateStatus;

const LatestNewsEventsManagement: React.FC = () => {
  return (
    <UniversalDataManagement<LatestNewsEventItem>
      title="Latest News and Events"
      listName="LatestNewsAndEvents"
      imageLibraryName="LatestNewsImages"
      columns={columns}
      fields={fields}
      services={services}
      spContext={spContext}
      defaultImage="https://via.placeholder.com/60x40/4A90E2/FFFFFF?text=News"
      searchPlaceholder="Search news or events..."
      createButtonText="Create New"
      drawerWidth={536}
      pageSize={10}
      className="latest-news-events-data-management"
    />
  );
};

export default LatestNewsEventsManagement;
