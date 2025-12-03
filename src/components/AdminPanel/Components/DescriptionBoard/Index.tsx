import * as React from 'react';
import { Tag } from 'antd';
import { spContext } from '../../../../App';
import UniversalDataManagement, { BaseDataItem, ColumnConfig, FieldConfig, ServiceConfig } from '../../BasicComponents/UniversalDataManagement/Index';
import {
  getDescriptionBoardItems,
  addDescriptionBoardItem,
  updateDescriptionBoardItem,
  deleteDescriptionBoardItem,
  uploadDescriptionBoardAsync,
  deleteDescriptionBoardImage
} from '../../../../services/adminServices/DescriptionBoardService/DescriptionBoardService';
import { dateFormat } from '../../../../utils/utils';
import * as dayjs from 'dayjs';

// Extend your base data model
interface DescriptionBoardItem extends BaseDataItem {
  id: number;
  image: string;
  title: string;
  description: string;
  body: string;
  date: string;
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
            const minHeight = 420, maxHeight = 450;

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
    
    if (trimmedValue.length > 10) {
        return `Title must not exceed 10 characters. Current: ${trimmedValue.length} characters`;
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
    
    if (trimmedValue.length > 250) {
        return `Subtext must not exceed 250 characters. Current: ${trimmedValue.length} characters`;
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
    
    // if (trimmedValue.length > 300) {
    //     return `Description must not exceed 300 characters. Current: ${trimmedValue.length} characters`;
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
      <img src={image} alt="description-board" className="image-universal-data-management" />
    )
  },
  {
    key: 'title',
    title: 'News Title',
    width: 200,
    searchable: true
  },
  {
    key: 'description',
    title: 'Short Description',
    width: 200,
    searchable: true
  },
  {
    key: 'body',
    title: 'Description',
    width: 200
  },
  {
    key: 'date',
    title: 'Date Uploaded',
    width: 120
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

// Define form field configuration
const fields: FieldConfig[] = [
  {
    key: 'image',
    label: 'Image (800×420 to 1280×450)',
    type: 'file',
    accept: 'image/png',
    required: true,
    validator: validateImageDimensions,
  },
  {
    key: 'title',
    label: 'News Title',
    type: 'text',
    required: true,
    placeholder: 'Enter title (max 10 characters)',
    validator: validateTitle,
  },
  {
    key: 'description',
    label: 'Short Description',
    type: 'text',
    required: false,
    placeholder: 'Enter Short Description (max 250 characters)',
    validator: validateSubtext,
  },
  {
    key: 'body',
    label: 'Description',
    type: 'textarea',
    required: false,
    rows: 4,
    placeholder: 'Enter Description',
    validator: validateParagraph,
  },
  {
    key: 'date',
    label: 'Date Uploaded',
    type: 'date',
    required: false,
    placeholder: 'Select Date'
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

// Define service configuration
const services: ServiceConfig<DescriptionBoardItem> = {
  fetchData: async (sp, listName) => {
    const items = await getDescriptionBoardItems(sp, listName);
    return items ?? [];
  },

  addData: async (sp, listName, data, file?, pdfFile?) => {
    await addDescriptionBoardItem(sp, listName, data);
  },

  updateData: async (sp, listName, id, data, file?: File, pdfFile?: File) => {
    await updateDescriptionBoardItem(sp, listName, id, data);
  },

  deleteData: async (sp, listName, id) => {
    return await deleteDescriptionBoardItem(sp, listName, id);
  },

  uploadFile: async (sp, libraryName, fileInfo) => {
    const result = await uploadDescriptionBoardAsync(sp, libraryName, fileInfo);
    return result ?? '';
  },

  deleteFile: async (sp, fileUrl) => {
    return await deleteDescriptionBoardImage(sp, fileUrl);
  },

  mapResponseToData: (items: any[]): DescriptionBoardItem[] => {
    return items.map(item => ({
      id: item.ID,
      title: item.Title,
      description: item.Description,
      body: item.Body,
      image: item.Image,
      date: dateFormat(item.Date),
      status: item.Status || 'draft'
    }));
  },

  mapFormDataToRequest: (formData: Partial<DescriptionBoardItem>) => {
    return {
      Title: formData.title,
      Description: formData.description,
      Body: formData.body,
      Image: formData.image,
      Date: formData.date ? dayjs(formData.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      Status: formData.status || 'draft'
    };
  }
};

const DescriptionBoardManagement: React.FC = () => {
  return (
    <UniversalDataManagement<DescriptionBoardItem>
      title="Description Board"
      listName="DiscussionBoard"
      imageLibraryName="DiscussionBoardImages"
      columns={columns}
      fields={fields}
      services={services}
      spContext={spContext}
      defaultImage="https://via.placeholder.com/60x40/4A90E2/FFFFFF?text=News"
      searchPlaceholder="Search description board..."
      createButtonText="Create New"
      drawerWidth={536}
      pageSize={10}
      className="description-board-data-management"
    />
  );
};

export default DescriptionBoardManagement;
