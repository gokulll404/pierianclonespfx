import * as React from 'react';
import { Tag } from 'antd';
import { spContext } from '../../../../App';
import {
    addCarouselData,
    deleteCarouselData,
    deleteFileFromDocumentLibrary,
    getCarouselData,
    updateCarouselData,
    uploadFileToPictureLibraryAsync
} from '../../../../services/adminServices/CarouselDataSerivces/CarouselDataSerivces';
import UniversalDataManagement, { BaseDataItem, ColumnConfig, FieldConfig, ServiceConfig } from '../../BasicComponents/UniversalDataManagement/Index';

// Define your data interface
interface CarouselData extends BaseDataItem {
    id: number;
    title: string;
    description: string;
    mediaType: string;
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

// Define columns configuration
const columns: ColumnConfig[] = [
    {
        key: 'image',
        title: 'Image',
        width: 80,
        render: (image: string) => (
            <img
                src={image}
                alt="carousel"
                className="image-universal-data-management"
            />
        ),
    },
    {
        key: 'title',
        title: 'Media Gallery Title',
        width: 200,
        searchable: true,
        render: (title: string) => (
            <div title={title}>
                {title.length > 25 ? `${title.substring(0, 25)}...` : title}
            </div>
        ),
    },
    {
        key: 'description',
        title: 'Description',
        width: 200,
        searchable: true,
        render: (description: string) => (
            <div title={description}>
                {description.length > 50 ? `${description.substring(0, 50)}...` : description}
            </div>
        ),
    },
    // {
    //     key: 'mediaType',
    //     title: 'Media Type',
    //     width: 120,
    // },
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
        label: 'Image (800×420 to 1280×450)',
        type: 'file',
        accept: 'image/png,image/jpeg,image/jpg',
        required: true,
        validator: validateImageDimensions,
    },
    {
        key: 'title',
        label: 'Media Gallery Title',
        type: 'text',
        required: true,
        placeholder: 'Enter title (Max 60 characters)',
        validator: validateTitle,
    },
    {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        required: true,
        placeholder: 'Enter description (Max 550 characters)',
        rows: 4,
        validator: validateDescription,
    },
    // {
    //     key: 'mediaType',
    //     label: 'Media Type',
    //     type: 'select',
    //     required: true,
    //     placeholder: 'Select media type',
    //     options: [
    //         { value: 'Image', label: 'Image' },
    //         { value: 'Video', label: 'Video' },
    //     ],
    // },
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
const services: ServiceConfig<CarouselData> = {
    fetchData: async (sp: any, listName: string) => {
        const items = await getCarouselData(sp, listName);
        return items ?? []; // Ensures it always returns an array
    },

    addData: async (sp: any, listName: string, data: any, file?: any, pdfFile?: File | null | undefined) => {
        await addCarouselData(sp, listName, data);
    },

    updateData: async (sp: any, listName: string, id: number, data: any) => {
        await updateCarouselData(sp, listName, id, data);
    },

    deleteData: async (sp: any, listName: string, id: number) => {
        return await deleteCarouselData(sp, listName, id);
    },

    uploadFile: async (sp: any, libraryName: string, fileInfo: any): Promise<string> => {
        const result = await uploadFileToPictureLibraryAsync(sp, libraryName, fileInfo);
        return result ?? ""; // Ensure string is always returned
    },

    deleteFile: async (sp: any, fileUrl: string) => {
        return await deleteFileFromDocumentLibrary(sp, fileUrl);
    },

    mapResponseToData: (items: any[]): CarouselData[] => {
        return items.map((item: any) => ({
            id: item.Id,
            title: item.Title,
            description: item.Description,
            mediaType: item.MediaType,
            image: item.ThumbnailURL,
            status: item.Status || "draft"
        }));
    },

    mapFormDataToRequest: (formData: Partial<CarouselData>) => {
        return {
            Title: formData.title,
            Description: formData.description,
            MediaType: formData.mediaType,
            ThumbnailURL: formData.image,
            Status: formData.status || "draft"
        };
    },
};

const CarouselDataManagement: React.FC = () => {
    return (
        <UniversalDataManagement<CarouselData>
            title="Media Gallery"
            listName="MediaGallery"
            imageLibraryName="MediaGalleryImages"
            columns={columns}
            fields={fields}
            services={services}
            spContext={spContext}
            defaultImage="https://via.placeholder.com/60x40/4A90E2/FFFFFF?text=News"
            searchPlaceholder="Search media gallery..."
            createButtonText="Create New"
            drawerWidth={536}
            pageSize={10}
            className="carousel-data-management"
        />
    );
};

export default CarouselDataManagement;