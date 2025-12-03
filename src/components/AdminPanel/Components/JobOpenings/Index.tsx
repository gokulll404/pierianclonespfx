import * as React from 'react';
import { spContext } from '../../../../App';

import UniversalDataManagement, { BaseDataItem, ColumnConfig, FieldConfig, ServiceConfig } from '../../BasicComponents/UniversalDataManagement/Index';

import {
    getJobOpeningItems,
    addJobOpeningItem,
    updateJobOpeningItem,
    deleteJobOpeningItem,
    uploadPdfToDocumentLibrary,
    deletePdfFromDocumentLibrary,
    clearColumnIfNoPdf
} from '../../../../services/adminServices/JobOpeningsServices/JobOpenings';

import { dateFormat } from '../../../../utils/utils';
import * as dayjs from 'dayjs';
import { Tag, Button } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';

interface JobItem extends BaseDataItem {
    ID: number;
    Title: string;
    BU: string;
    Experience: string;
    Location: string;
    Description: string;
    DatePosted: string;
    minExp?: number;
    maxExp?: number;
    status?: 'publish' | 'unpublish' | 'draft';
    jobDescriptionPdf?: any; // For file upload
    JDAttachments?: string; // For storing PDF path
}

// Job title validation function
const validateJobTitle = (value: any): string | null => {
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

// Location validation function
const validateLocation = (value: any): string | null => {
    if (!value || typeof value !== 'string') {
        return 'Location is required';
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
        return 'Location cannot be empty';
    }

    if (trimmedValue.length > 60) {
        return `Location must not exceed 60 characters. Current: ${trimmedValue.length} characters`;
    }

    return null;
};

// Desc validation function
const validateDescription = (value: any): string | null => {
    if (!value || typeof value !== 'string') {
        return 'Description is required';
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
        return 'Description cannot be empty';
    }

    return null;
};

const columns: ColumnConfig[] = [
    {
        key: 'Title',
        title: 'Job Title',
        width: 200,
        searchable: true
    },
    {
        key: 'BU',
        title: 'BU/Client ',
        width: 200,
        searchable: true
    },
    {
        key: 'Experience',
        title: 'Experience',
        width: 150
    },
    {
        key: 'Location',
        title: 'Location',
        width: 150
    },
    {
        key: 'Description',
        title: 'Job Description',
        width: 250
    },
    {
        key: 'JDAttachments',
        title: 'PDF Attachment',
        width: 150,
        render: (fileUrl?: string) => {
            if (!fileUrl) return <span>No PDF</span>;
            
            return (
                <Button
                    type="link"
                    icon={<FilePdfOutlined />}
                    onClick={() => {
                        // Create download link
                        const baseUrl = window.location.origin;
                        const downloadUrl = `${baseUrl}${fileUrl}`;
                        window.open(downloadUrl, '_blank');
                    }}
                    className="pdf-download-button"
                >
                    Download PDF
                </Button>
            );
        },
    },
    {
        key: 'DatePosted',
        title: 'Date Posted',
        width: 160,
    },
    {
        key: 'status',
        title: 'Status',
        width: 100,
        render: (status?: string) => {
            if (!status) return <Tag color="default">N/A</Tag>;
            const color = status === 'publish' ? 'green' : status === 'unpublish' ? 'red' : 'orange';
            return <Tag color={color}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>;
        },
    },
];

const fields: FieldConfig[] = [
    {
        key: 'Title',
        label: 'Job Title',
        type: 'text',
        required: true,
        placeholder: 'Enter Job title (max 60 characters)',
        validator: validateJobTitle,
    },
    {
        key: 'BU',
        label: 'BU/Client ',
        type: 'text',
        required: true,
        placeholder: 'Enter BU/Client (max 60 characters)',
        validator: validateJobTitle,
    },
    {
        key: 'minExp',
        label: 'Minimum Experience',
        type: 'number',
        required: true,
        placeholder: 'e.g. 2',
    },
    {
        key: 'maxExp',
        label: 'Maximum Experience',
        type: 'number',
        required: true,
        placeholder: 'e.g. 5'
    },
    {
        key: 'Location',
        label: 'Location',
        type: 'text',
        required: true,
        placeholder: 'Enter Job Location title (max 60 characters)',
        validator: validateLocation,
    },
    {
        key: 'Description',
        label: 'Job Description',
        type: 'textarea',
        required: true,
        placeholder: 'Enter Job Description title',
        validator: validateDescription
    },
    {
        key: 'JDAttachments',
        label: 'Job Description PDF',
        type: 'pdfFile',
        required: false, // Made optional as requested
        placeholder: 'Upload Job Description PDF',
        accept: 'application/pdf,.pdf',
        multiple: false
    },
    {
        key: 'DatePosted',
        label: 'Date Posted',
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
            { value: 'publish', label: 'Publish' },
        ],
    },
];

const services: ServiceConfig<JobItem> = {
    fetchData: async (sp, listName) => {
        const items = await getJobOpeningItems(sp, listName);
        return items ?? [];
    },

    addData: async (sp, listName, data, pdfFile) => {
        await addJobOpeningItem(sp, listName, data, pdfFile);
    },

    updateData: async (sp, listName, id, data, pdfFile) => {
        await updateJobOpeningItem(sp, listName, id, data, pdfFile ?? null);
    },

    deleteData: async (sp, listName, id) => {
        return await deleteJobOpeningItem(sp, listName, id);
    },

    uploadFile: async (sp, libraryName, fileInfo) => {
        return await uploadPdfToDocumentLibrary(sp, libraryName, fileInfo.file);
    },

    deleteFile: async (sp, fileUrl) => {
        return await deletePdfFromDocumentLibrary(sp, fileUrl);
    },

    clearColumnIfNoData: async (sp, listName, id) => {
        return await clearColumnIfNoPdf(sp, listName, id);
    },

    mapResponseToData: (items: any[]): JobItem[] => {
        return items.map(item => {
            const [minExp = 0, maxExp = 0] = item.experience
                ? item.experience.split(/[–-]/).map((str: string) => parseInt(str.trim()))
                : [0, 0];

            return {
                id: item.ID,
                ID: item.ID,
                Title: item.jobTitle || '',
                Location: item.location || '',
                Description: item.JobDescription || '',
                DatePosted: dateFormat(item.DatePosted) || '',
                Experience: item.experience || '',
                BU: item.BU,
                minExp,
                maxExp,
                status: item.Status || 'draft',
                JDAttachments: item.JDAttachments || '' // Map PDF path
            };
        });
    },

    mapFormDataToRequest: (formData: Partial<JobItem>) => {
        const experience = `${formData.minExp || 0}–${formData.maxExp || 0} years`;

        const requestData: any = {
            Title: formData.Title,
            jobTitle: formData.Title,
            location: formData.Location,
            BU: formData.BU,
            JobDescription: formData.Description,
            DatePosted: dayjs(formData.DatePosted).format('YYYY-MM-DD'),
            experience,
            Status: formData.status || 'draft'
        };

        // Only include JDAttachments if it exists
        if (formData.JDAttachments) {
            requestData.JDAttachments = formData.JDAttachments;
        }

        return requestData;
    }
};

const JobOpeningsManagement: React.FC = () => {
    return (
        <UniversalDataManagement<JobItem>
            title="Job Openings"
            listName="JobOpenings"
            columns={columns}
            fields={fields}
            services={services}
            spContext={spContext}
            searchPlaceholder="Search job openings..."
            createButtonText="Create New"
            drawerWidth={536}
            pageSize={10}
            className="job-openings-universal-data"
        />
    );
};

export default JobOpeningsManagement;



