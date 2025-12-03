import * as React from 'react';
import { Tag } from 'antd';
import { spContext } from '../../../../App';
import UniversalDataManagement, { BaseDataItem, ColumnConfig, FieldConfig, ServiceConfig } from '../../BasicComponents/UniversalDataManagement/Index';
import {
  getLeadershipMessagesItems,
  addLeadershipMessagesItem,
  updateLeadershipMessagesItem,
  deleteLeadershipMessagesItem,
  uploadLeadershipMessagesImageAsync,
  deleteLeadershipMessagesImage
} from '../../../../services/adminServices/LeadershipMessagesService/LeadershipMessagesService';
import { dateFormat } from '../../../../utils/utils';

const DEFAULT_IMAGE = 'https://via.placeholder.com/60x40/4A90E2/FFFFFF?text=News';

export interface LeadershipMessageData extends BaseDataItem {
  id: number;
  title: string;
  designation: string;
  message: string;
  date: string;
  image: string;
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
            const minWidth = 200, maxWidth = 400;
            const minHeight = 200, maxHeight = 400;

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
const validateName = (value: any): string | null => {
    if (!value || typeof value !== 'string') {
        return 'Name is required';
    }
    
    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
        return 'Name cannot be empty';
    }
    
    if (trimmedValue.length > 60) {
        return `Name must not exceed 60 characters. Current: ${trimmedValue.length} characters`;
    }
    
    return null;
};

// Description validation function
const validateDesignation = (value: any): string | null => {
    if (!value || typeof value !== 'string') {
        return 'Designation is required';
    }
    
    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
        return 'Designation cannot be empty';
    }
    
    if (trimmedValue.length > 60) {
        return `Designation must not exceed 60 characters. Current: ${trimmedValue.length} characters`;
    }
    
    return null;
};

// Body validation function
const validateMessage = (value: any): string | null => {
    if (!value || typeof value !== 'string') {
        return 'Message is required';
    }
    
    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
        return 'Message cannot be empty';
    }
    
    if (trimmedValue.length > 550) {
        return `Message must not exceed 550 characters. Current: ${trimmedValue.length} characters`;
    }
    
    return null;
};


// Columns
const columns: ColumnConfig[] = [
  {
    key: 'image',
    title: 'User Image',
    width: 80,
    render: (image: string) => (
      <img
        src={image}
        alt="user"
        className="image-universal-data-management"
      />
    )
  },
  {
    key: 'title',
    title: 'Name',
    width: 200,
    searchable: true
  },
  {
    key: 'designation',
    title: 'Designation',
    width: 200,
    searchable: true
  },
  {
    key: 'message',
    title: 'Message',
    width: 240
  },
 {
     key: 'date',
     title: 'Modified Date',
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
    }
  }
];

// Fields
const fields: FieldConfig[] = [
  {
    key: 'image',
    label: 'User Image (200x200 to 400x400)',
    type: 'file',
    accept: 'image/png,image/jpeg,image/jpg',
    required: true,
    validator: validateImageDimensions,
  },
  {
    key: 'title',
    label: 'Name',
    type: 'text',
    required: true,
    placeholder: 'Enter title (max 60 characters)',
    validator: validateName,
  },
  {
    key: 'designation',
    label: 'Designation',
    type: 'text',
    required: true,
    placeholder: 'Enter Designation (max 60 characters)',
    validator: validateDesignation,
  },
  {
    key: 'message',
    label: 'Message',
    type: 'textarea',
    required: true,
    placeholder: 'Enter Message (max 550 characters)',
    rows: 4,
    validator: validateMessage,
  },
  {
    key: 'status',
    label: 'Status',
    type: 'radio',
    required: true,
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'unpublish', label: 'Unpublish' },
      { value: 'publish', label: 'Publish' }
    ]
  }
];

// Services
const services: ServiceConfig<LeadershipMessageData> = {
  fetchData: async (sp: any, listName: string) => {
    const items = await getLeadershipMessagesItems(sp, listName);
    return items ?? [];
  },

  addData: async (sp: any, listName: string, data: any, file?: any, pdfFile?: File | null | undefined) => {
    await addLeadershipMessagesItem(sp, listName, data);
  },

  updateData: async (sp: any, listName: string, id: number, data: any, file?: any, pdfFile?: File | null | undefined) => {
    await updateLeadershipMessagesItem(sp, listName, id, data);
  },

  deleteData: async (sp: any, listName: string, id: number) => {
    return await deleteLeadershipMessagesItem(sp, listName, id);
  },

  uploadFile: async (sp: any, libraryName: string, fileInfo: any): Promise<string> => {
    const result = await uploadLeadershipMessagesImageAsync(sp, libraryName, fileInfo);
    return result ?? '';
  },

  deleteFile: async (sp: any, fileUrl: string) => {
    return await deleteLeadershipMessagesImage(sp, fileUrl);
  },

  mapResponseToData: (items: any[]): LeadershipMessageData[] => {
    return items.map((item: any) => ({
      id: item.ID,
      title: item.Title,
      designation: item.Designation,
      message: item.Message,
      image: item.UserImage,
      date: item.Modified,
      status: item.Status || 'draft'
    }));
  },

  mapFormDataToRequest: (formData: Partial<LeadershipMessageData>) => {
    return {
      Title: formData.title,
      Designation: formData.designation,
      Message: formData.message,
      UserImage: formData.image,
      Status: formData.status || 'draft'
    };
  }
};

const LeadershipMessagesManagement: React.FC = () => {
  return (
    <UniversalDataManagement<LeadershipMessageData>
      title="Leadership Messages"
      listName="LeadershipMessage"
      imageLibraryName="UserPhotos"
      columns={columns}
      fields={fields}
      services={services}
      spContext={spContext}
      defaultImage={DEFAULT_IMAGE}
      searchPlaceholder="Search leadership messages..."
      createButtonText="Create New"
      drawerWidth={536}
      pageSize={10}
      className="leadership-messages-data-management"
    />
  );
};

export default LeadershipMessagesManagement;
