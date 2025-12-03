import * as React from 'react';
import { spContext } from '../../../../App';
import { Tag } from 'antd';
import * as dayjs from 'dayjs';

import UniversalDataManagement, { BaseDataItem, ColumnConfig, FieldConfig, ServiceConfig } from '../../BasicComponents/UniversalDataManagement/Index';

import {
  getHRAnnouncementItems,
  addHRAnnouncementItem,
  updateHRAnnouncementItem,
  deleteHRAnnouncementItem
} from '../../../../services/adminServices/HRAnnouncementsSerivce/HRAnnouncements';

import { dateFormat } from '../../../../utils/utils';

interface HRAnnouncementItem extends BaseDataItem {
  id: number;
  title: string;
  description: string;
  date: string;
  status?: 'publish' | 'unpublish' | 'draft';
}

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
const validateDescription = (value: any): string | null => {
    if (!value || typeof value !== 'string') {
        return 'Description is required';
    }
    
    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
        return 'Description cannot be empty';
    }
    
    if (trimmedValue.length > 550) {
        return `Description must not exceed 550 characters. Current: ${trimmedValue.length} characters`;
    }
    
    return null;
};

const columns: ColumnConfig[] = [
  {
    key: 'title',
    title: 'Title',
    width: 240,
    searchable: true
  },
  {
    key: 'description',
    title: 'Description',
    width: 300
  },
  {
    key: 'date',
    title: 'Date',
    width: 160
  },
  {
    key: 'status',
    title: 'Status',
    width: 100,
    render: (status: string = 'draft') => {
      const color = status === 'publish' ? 'green' : status === 'unpublish' ? 'red' : 'orange';
      return <Tag color={color}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>;
    }
  }
];

const fields: FieldConfig[] = [
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
    label: 'Description',
    type: 'textarea',
    required: true,
    placeholder: 'Enter title (max 550 characters)',
    validator: validateDescription,
  },
  {
    key: 'date',
    label: 'Date',
    type: 'date',
    required: true,
    placeholder: 'Select date'
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

const services: ServiceConfig<HRAnnouncementItem> = {
  fetchData: async (sp, listName) => {
    const items = await getHRAnnouncementItems(sp, listName);
    return items ?? [];
  },

  addData: async (sp, listName, data, file?, pdfFile?) => {
    await addHRAnnouncementItem(sp, listName, data);
  },

  updateData: async (sp, listName, id, data) => {
    await updateHRAnnouncementItem(sp, listName, id, data);
  },

  deleteData: async (sp, listName, id) => {
    return await deleteHRAnnouncementItem(sp, listName, id);
  },

  uploadFile: undefined,
  deleteFile: undefined,

  mapResponseToData: (items: any[]): HRAnnouncementItem[] => {
    return items.map(item => ({
      id: item.ID,
      title: item.Title,
      description: item.Description || '',
      date: dateFormat(item.Date),
      status: item.Status || 'draft'
    }));
  },

  mapFormDataToRequest: (formData: Partial<HRAnnouncementItem>) => {
    return {
      Title: formData.title,
      Description: formData.description || '',
      Date: formData.date ? dayjs(formData.date).format('YYYY-MM-DD') : undefined,
      Status: formData.status || 'draft'
    };
  }
};

const HRAnnouncementManagement: React.FC = () => {
  return (
    <UniversalDataManagement<HRAnnouncementItem>
      title="HR Announcements"
      listName="HRAnnouncements"
      imageLibraryName=""
      columns={columns}
      fields={fields}
      services={services}
      spContext={spContext}
      searchPlaceholder="Search HR announcements..."
      createButtonText="Create New"
      drawerWidth={536}
      pageSize={10}
      className="hr-announcements-universal-data"
    />
  );
};

export default HRAnnouncementManagement;
