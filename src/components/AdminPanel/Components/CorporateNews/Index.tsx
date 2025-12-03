import * as React from 'react';
import { Tag } from 'antd';
import { spContext } from '../../../../App';
import { addCorporateNewsItem, deleteCorporateImage, deleteCorporateNewsItem, getCorporateNewsItems, updateCorporateNewsItem, uploadCorporateImageAsync } from '../../../../services/adminServices/CorporateNewsService/CorporateNewsService';
import * as dayjs from 'dayjs';
import { dateFormat } from '../../../../utils/utils';
import UniversalDataManagement, { BaseDataItem, ColumnConfig, FieldConfig, ServiceConfig } from '../../BasicComponents/UniversalDataManagement/Index';

// Define your data interface
interface CorporateNewData extends BaseDataItem {
    id: number;
    title: string;
    description: string;
    body: string;
    dateuploaded: string;
    image: string;
    status: "publish" | "unpublish" | "draft";
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
const validateDescription = (value: any): string | null => {
    if (!value || typeof value !== 'string') {
        return 'Description is required';
    }
    
    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
        return 'Description cannot be empty';
    }
    
    if (trimmedValue.length > 350) {
        return `Description must not exceed 350 characters. Current: ${trimmedValue.length} characters`;
    }
    
    return null;
};

// Body validation function
const validateBody = (value: any): string | null => {
    if (!value || typeof value !== 'string') {
        return 'Body is required';
    }
    
    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
        return 'Body cannot be empty';
    }
    
    // if (trimmedValue.length > 300) {
    //     return `Body must not exceed 300 characters. Current: ${trimmedValue.length} characters`;
    // }
    
    return null;
};

// Define columns configuration
const columns: ColumnConfig[] = [
    {
        key: 'image',
        title: 'Image',
        width: 80,
        render: (image: string) => (
            <img
                src={image}
                alt="corporate-news"
                className="image-universal-data-management"
            />
        ),
    },
    {
        key: 'title',
        title: 'News Title',
        width: 200,
        searchable: true,
    },
    {
        key: 'description',
        title: 'Short Description',
        width: 200,
        searchable: true,
    },
    {
        key: 'body',
        title: 'Description',
        width: 120,
    },
    {
        key: 'dateuploaded',
        title: 'Date Uploaded',
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

// Define form fields configuration
const fields: FieldConfig[] = [
    {
        key: 'image',
        label: 'Image (800×420 to 1280×1200)',
        type: 'file',
        accept: 'image/png,image/jpeg,image/jpg',
        required: true,
        validator: validateImageDimensions,
    },
    {
        key: 'title',
        label: 'News Title',
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
        validator: validateDescription,
    },
    {
        key: 'body',
        label: 'Description',
        type: 'textarea',
        required: false,
        placeholder: 'Enter Description',
        rows: 4,
        validator: validateBody,
    },
    {
        key: 'dateuploaded',
        label: 'Date Uploaded',
        type: 'date',
        required: false,
        placeholder: 'Select Date',
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

// Define services configuration
const services: ServiceConfig<CorporateNewData> = {
    fetchData: async (sp: any, listName: string) => {
        const items = await getCorporateNewsItems(sp, listName);
        return items ?? []; // Ensures it always returns an array
    },

    addData: async (sp: any, listName: string, data: any, file?: any, pdfFile?: File | null | undefined) => {
        await addCorporateNewsItem(sp, listName, data);
    },

    updateData: async (sp: any, listName: string, id: number, data: any, pdfFile?: File | null | undefined) => {
        await updateCorporateNewsItem(sp, listName, id, data);
    },

    deleteData: async (sp: any, listName: string, id: number) => {
        return await deleteCorporateNewsItem(sp, listName, id);
    },

    uploadFile: async (sp: any, libraryName: string, fileInfo: any): Promise<string> => {
        const result = await uploadCorporateImageAsync(sp, libraryName, fileInfo);
        return result ?? ""; // Ensure string is always returned
    },

    deleteFile: async (sp: any, fileUrl: string) => {
        return await deleteCorporateImage(sp, fileUrl);
    },

    mapResponseToData: (items: any[]): CorporateNewData[] => {
        return items.map((item: any) => ({
            id: item.ID,
            body: item.Body,
            dateuploaded: dateFormat(item.Date),
            description: item.Description,
            image: item.Image,
            title: item.Title,
            status: item.Status || "draft"
        }));
    },

    mapFormDataToRequest: (formData: Partial<CorporateNewData>) => {
        return {
            Image: formData.image,
            Title: formData.title,
            Description: formData.description,
            Body: formData.body,
            Date: dayjs(formData.dateuploaded).format('YYYY-MM-DD'),
            Status: formData.status || "draft"
        };
    },
};

// Custom validation example
const validateStatus = (value: any): string | null => {
    if (value === 'publish' && (!fields.find(f => f.key === 'description')?.required)) {
        // Add custom validation logic here
        return null;
    }
    return null;
};

// Add custom validation to status field
fields.find(f => f.key === 'status')!.validator = validateStatus;

const CorporateNewsManagement: React.FC = () => {
    return (
        <UniversalDataManagement<CorporateNewData>
            title="Corporate News"
            listName="CorporateNews"
            imageLibraryName="CorporatePhotoGallery"
            columns={columns}
            fields={fields}
            services={services}
            spContext={spContext}
            defaultImage="https://via.placeholder.com/60x40/4A90E2/FFFFFF?text=News"
            searchPlaceholder="Search corporate news data..."
            createButtonText="Create New"
            drawerWidth={536}
            pageSize={10}
            className="corporate-news-data-management"
        />
    );
};

export default CorporateNewsManagement;