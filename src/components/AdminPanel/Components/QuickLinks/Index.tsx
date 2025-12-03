import * as React from 'react';
import { spContext } from '../../../../App';
import { Tag } from 'antd';

import UniversalDataManagement, { BaseDataItem, ColumnConfig, FieldConfig, ServiceConfig } from '../../BasicComponents/UniversalDataManagement/Index';
import { addQuickLinkItem, deleteQuickLinkItem, getQuickLinkItems, updateQuickLinkItem } from '../../../../services/adminServices/QuickLinksServices/QuickLinksServices';

interface QuickLinkItem extends BaseDataItem {
  id: number;
  label: string;
  customURL: string;
  tooltip?: string; // ✅ Optional tooltip
  status?: 'publish' | 'unpublish' | 'draft';
}

// label validation function
const validateLabel = (value: any): string | null => {
    if (!value || typeof value !== 'string') {
        return 'Label is required';
    }
    
    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
        return 'Label cannot be empty';
    }
    
    if (trimmedValue.length > 60) {
        return `Label must not exceed 60 characters. Current: ${trimmedValue.length} characters`;
    }
    
    return null;
};

// URL validation
const validateURL = (value: any): string | null => {
  if (!value || typeof value !== 'string') {
    return 'URL is required';
  }

  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    return 'URL cannot be empty';
  }

  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,63}(\/[^\s]*)?$/;

  if (!urlPattern.test(trimmedValue)) {
    return 'Please enter a valid URL';
  }

  return null; // Valid
};

const columns: ColumnConfig[] = [
  {
    key: 'label',
    title: 'Label',
    width: 200,
    searchable: true,
  },
  {
    key: 'tooltip',
    title: 'Tooltip',
    width: 250,
    render: (tooltip: string) => (
      tooltip ? (

          <span>{tooltip}</span>
  
      ) : (
        <span style={{ color: '#999' }}>—</span>
      )
    )
  },
  {
    key: 'customURL',
    title: 'URL',
    width: 300,
    render: (url: string) => (
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>
        {url}
      </a>
    )
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
    key: 'label',
    label: 'Label',
    type: 'text',
    required: true,
    placeholder: 'Enter link label ( Max 60 Characters)',
    validator: validateLabel,
  },
  {
    key: 'tooltip',
    label: 'Tooltip',
    type: 'text',
    required: false,
    placeholder: 'Enter tooltip text (optional)',
  },
  {
    key: 'customURL',
    label: 'URL',
    type: 'text',
    required: true,
    placeholder: 'Enter URL (e.g., https://example.com)',
    validator: validateURL,
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

const services: ServiceConfig<QuickLinkItem> = {
  fetchData: async (sp, listName) => {
    const items = await getQuickLinkItems(sp, listName);
    return items ?? [];
  },

  addData: async (sp, listName, data) => {
    await addQuickLinkItem(sp, listName, data);
  },

  updateData: async (sp, listName, id, data) => {
    await updateQuickLinkItem(sp, listName, id, data);
  },

  deleteData: async (sp, listName, id) => {
    return await deleteQuickLinkItem(sp, listName, id);
  },

  uploadFile: undefined,
  deleteFile: undefined,

  mapResponseToData: (items: any[]): QuickLinkItem[] => {
    return items.map(item => ({
      id: item.ID,
      label: item.Label || '',
      tooltip: item.Tooltip || '',
      customURL: item.CustomURL || '',
      status: item.Status || 'draft'
    }));
  },

  mapFormDataToRequest: (formData: Partial<QuickLinkItem>) => {
    return {
      Label: formData.label,
      Tooltip: formData.tooltip || '',
      CustomURL: formData.customURL,
      Status: formData.status || 'draft'
    };
  }
};

const QuickLinkManagement: React.FC = () => {
  return (
    <UniversalDataManagement<QuickLinkItem>
      title="Quick Links"
      listName="QuickLinks"
      imageLibraryName=""
      columns={columns}
      fields={fields}
      services={services}
      spContext={spContext}
      searchPlaceholder="Search quick links..."
      createButtonText="Create New Link"
      drawerWidth={536}
      pageSize={10}
      className="quick-links-universal-data"
    />
  );
};

export default QuickLinkManagement;
