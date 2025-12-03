import * as React from 'react';
import { spContext } from '../../../../App';
import UniversalDataManagement, { BaseDataItem, ColumnConfig, FieldConfig, ServiceConfig } from '../../BasicComponents/UniversalDataManagement/Index';
import {
    getCorporateEvents,
    addCoroperateEvent,
    updateCoroperateEvent,
    deleteCoroperateEvent,
    uploadFileToPictureLibraryAsync,
    deleteFileFromDocumentLibrary
} from '../../../../services/adminServices/CorporateEventServices/CorporateEventServices';
import * as dayjs from 'dayjs';
import { dateFormat } from '../../../../utils/utils';
import { Tag } from 'antd';

interface CorporateEventData extends BaseDataItem {
    id: number;
    image: string;
    eventTitle: string;
    subText: string;
    paragraphs: string;
    dateUploaded: string;
    location: string;
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
    
    if (trimmedValue.length > 60) {
        return `Title must not exceed 60 characters. Current: ${trimmedValue.length} characters`;
    }
    
    return null;
};

// Description validation function
const validateSubtext = (value: any): string | null => {
    if (!value || typeof value !== 'string') {
        return 'Short Description is required';
    }
    
    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
        return 'Short Description cannot be empty';
    }
    
    if (trimmedValue.length > 350) {
        return `Short Description must not exceed 350 characters. Current: ${trimmedValue.length} characters`;
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

const columns: ColumnConfig[] = [
    {
        key: 'image',
        title: 'Image',
        width: 80,
        render: (image: string) => (
            <img src={image} alt="event" className="image-universal-data-management" />
        ),
    },
    {
        key: 'eventTitle',
        title: 'Event Title',
        width: 200,
        searchable: true,
    },
    {
        key: 'subText',
        title: 'Short Description',
        width: 180,
        searchable: true,
    },
    {
        key: 'paragraphs',
        title: 'Description',
        width: 200,
    },
    {
        key: 'location',
        title: 'Location',
        width: 120,
    },
    {
        key: 'dateUploaded',
        title: 'Event Date',
        width: 120,
    },
    {
        key: 'status',
        title: 'Status',
        width: 100,
        render: (status: string) => {
            const color = status === 'publish' ? 'green' : status === 'unpublish' ? 'red' : 'orange';
            return <Tag color={color}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>;
        },
    },
];

const fields: FieldConfig[] = [
    {
        key: 'image',
        label: 'Image (800×420 to 1280×450)',
        type: 'file',
        accept: 'image/png,image/jpeg,image/jpg',
        required: true,
        validator: validateImageDimensions,
    },
    {
        key: 'eventTitle',
        label: 'Event Title',
        type: 'text',
        required: true,
        placeholder: 'Enter title (max 60 characters)',
        validator: validateTitle,
    },
    {
        key: 'subText',
        label: 'Short Description',
        type: 'text',
        required: true,
        placeholder: 'Enter Short Description (max 350 characters)',
        validator: validateSubtext,
    },
    {
        key: 'paragraphs',
        label: 'Description',
        type: 'textarea',
        required: true,
        placeholder: 'Enter Description',
        rows: 4,
        validator: validateParagraph,
    },
    {
        key: 'location',
        label: 'Location',
        type: 'text',
        required: true,
        placeholder: 'Enter location',
    },
    {
        key: 'dateUploaded',
        label: 'Event Date',
        type: 'date',
        required: true,
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
    },
];

const services: ServiceConfig<CorporateEventData> = {
    fetchData: async (sp, listName) => {
        const items = await getCorporateEvents(sp, listName);
        return items ?? [];
    },

    addData: async (sp, listName, data, file?, pdfFile?) => {
        await addCoroperateEvent(sp, listName, data);
    },

    updateData: async (sp, listName, id, data) => {
        await updateCoroperateEvent(sp, listName, id, data);
    },

    deleteData: async (sp, listName, id) => {
        return await deleteCoroperateEvent(sp, listName, id);
    },

    uploadFile: async (sp, libraryName, fileInfo): Promise<string> => {
        const result = await uploadFileToPictureLibraryAsync(sp, libraryName, fileInfo);
        return result ?? "";
    },

    deleteFile: async (sp, fileUrl) => {
        return await deleteFileFromDocumentLibrary(sp, fileUrl);
    },

    mapResponseToData: (items: any[]): CorporateEventData[] => {
        return items.map((item: any) => ({
            id: item.Id,
            eventTitle: item.Title,
            subText: item.Description,
            paragraphs: item.Body,
            dateUploaded: dateFormat(item.Date),
            image: item.Image,
            location: item.Location,
            status: item.Status || 'Draft',
        }));
    },

    mapFormDataToRequest: (formData: Partial<CorporateEventData>) => {
        return {
            Title: formData.eventTitle,
            EventsName: formData.eventTitle,
            Description: formData.subText,
            Body: formData.paragraphs,
            Date: dayjs(formData.dateUploaded).format('YYYY-MM-DD'),
            Image: formData.image,
            Location: formData.location,
            Status: formData.status,
        };
    },
};

const CorporateEventsManagement: React.FC = () => {
    return (
        <UniversalDataManagement<CorporateEventData>
            title="Corporate Events"
            listName="CorporateEvents"
            imageLibraryName="LatestNewsImages"
            columns={columns}
            fields={fields}
            services={services}
            spContext={spContext}
            defaultImage="https://via.placeholder.com/60x40/4A90E2/FFFFFF?text=Event"
            searchPlaceholder="Search corporate events..."
            createButtonText="Create Event"
            drawerWidth={536}
            pageSize={10}
            className="corporate-events-data-management"
        />
    );
};

export default CorporateEventsManagement;
