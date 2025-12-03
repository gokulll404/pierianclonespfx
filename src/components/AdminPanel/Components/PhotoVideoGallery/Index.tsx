import * as React from 'react';
import { FileImageOutlined, PlayCircleOutlined } from '@ant-design/icons';
import * as dayjs from 'dayjs';
import UniversalDataManagement, { BaseDataItem, ColumnConfig, FieldConfig, ServiceConfig } from '../../BasicComponents/UniversalDataManagement/Index';
import { spContext } from '../../../../App';
import { dateFormat } from '../../../../utils/utils';
import {
    addPhotoVideoGalleryItem,
    deletePhotoVideoGalleryItem,
    getPhotoVideoGalleryItems,
    updatePhotoVideoGalleryItem,
} from '../../../../services/adminServices/PhotoVideoGalleryService/PhotoVideoGalleryService';
import { Tag } from 'antd';

// Interface
interface MediaItem extends BaseDataItem {
    id: number;
    FileName: string;
    FileType: 'image' | 'video';
    FileDescription: string;
    FileUrl: string;
    Date: string;
    Status: 'publish' | 'unpublish' | 'draft';
}

const DEFAULT_IMAGE = 'https://via.placeholder.com/60x40/4A90E2/FFFFFF?text=Image';
const DEFAULT_VIDEO = 'https://via.placeholder.com/60x40/FF6B6B/FFFFFF?text=Video';


// File validator
const validateMediaFile = async (value: any): Promise<string | null> => {
    if (!value) {
        return "File is required";
    }

    // `value` could be a File object or an array depending on how your mediaFile uploader works
    const file: File = Array.isArray(value) ? value[0] : value;

    if (!(file instanceof File)) {
        return "Invalid file";
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (isImage) {
        const validTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            return "Only JPG, JPEG and PNG images are allowed";
        }

        if (file.size > 5 * 1024 * 1024) {
            return "Image size must not exceed 5MB";
        }

        // ✅ Dimension check
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
                    resolve(
                        `Image resolution must be between ${minWidth}×${minHeight} and ${maxWidth}×${maxHeight}. ` +
                        `Current: ${width}×${height}`
                    );
                } else {
                    resolve(null); // ✅ Valid image
                }
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve("Invalid image file");
            };

            img.src = url;
        });
    }

    if (isVideo) {
        const validTypes = ["video/mp4", "video/quicktime"]; // MOV = quicktime
        if (!validTypes.includes(file.type)) {
            return "Only MP4 or MOV videos are allowed";
        }
        if (file.size > 50 * 1024 * 1024) {
            return "Video size must not exceed 50MB";
        }
    }

    return null; // ✅ valid
};



// Description validation function
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
const validateDescription = (value: any): string | null => {
    if (!value || typeof value !== 'string') {
        return 'Description is required';
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
        return 'Description cannot be empty';
    }

    // if (trimmedValue.length > 550) {
    //     return `Description must not exceed 550 characters. Current: ${trimmedValue.length} characters`;
    // }

    return null;
};

const columns: ColumnConfig[] = [
    {
        key: 'FileUrl',
        title: 'Preview',
        width: 100,
        render: (fileUrl: string, record: MediaItem) => (
            <div className="gallery-management-preview-container">
                {record.FileType === 'image' ? (
                    <img
                        src={fileUrl}
                        alt="Preview"
                        className="gallery-management-preview-image"
                        style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                ) : (
                    <video
                        src={fileUrl}
                        className="gallery-management-preview-video"
                        style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                        controls
                    />
                )}
            </div>
        ),
    },
    {
        key: 'FileName',
        title: 'File Name',
        width: 200,
    },
    {
        key: 'FileType',
        title: 'File Type',
        width: 120,
        render: (type: 'image' | 'video') => (
            <span>
                {type === 'image' ? <><FileImageOutlined /> Image</> : <><PlayCircleOutlined /> Video</>}
            </span>
        ),
    },
    {
        key: 'FileDescription',
        title: 'File Description',
        width: 250,
    },
    {
        key: 'Date',
        title: 'Date Uploaded',
        width: 120,
        render: (text: string) => <span>{dateFormat(text)}</span>,
    },
    {
        key: 'Status',
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
        key: 'FileUrl',
        label: 'File Upload (Images: JPG/PNG ≤ 5MB, 800×420–1280×1200 | Videos: MP4/MOV ≤ 50MB)',
        type: 'mediaFile',
        required: true,
        fileTypeField: 'FileType',
        fileNameField: 'FileName',
        autoDetectType: true,
        validator: validateMediaFile,
    },
    {
        key: 'FileName',
        label: 'File Name',
        type: 'text',
        required: true,
        placeholder: 'Enter File Name (max 60 characters)',
        validator: validateName,
    },
    {
        key: 'FileDescription',
        label: 'File Description',
        type: 'textarea',
        required: true,
        placeholder: 'Enter Description',
        rows: 4,
        validator: validateDescription,
    },
    {
        key: 'Status',
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

const services: ServiceConfig<MediaItem> = {
    fetchData: async (sp, listName) => await getPhotoVideoGalleryItems(sp, listName),

    addData: async (sp, listName, data, file) => await addPhotoVideoGalleryItem(sp, listName, data, file),

    updateData: async (sp, listName, id, data) =>
        await updatePhotoVideoGalleryItem(sp, listName, id, data),

    deleteData: async (sp, listName, id) =>
        await deletePhotoVideoGalleryItem(sp, listName, id),

    mapResponseToData: (items: any[]): MediaItem[] => items.map(item => ({
        id: item.ID,
        ID: item.ID,
        FileName: item.FileName || 'Untitled',
        FileType: item.FileType || 'image',
        FileDescription: item.Description || '',
        FileUrl: item.FileUrl || (item.FileType === 'video' ? DEFAULT_VIDEO : DEFAULT_IMAGE),
        Date: dayjs(item.Date).format('YYYY-MM-DD'),
        Status: item.Status || 'draft',
    })),

    mapFormDataToRequest: (formData: Partial<MediaItem>) => ({
        Title: formData.FileName,
        FileName: formData.FileName,
        Description: formData.FileDescription,
        FileType: formData.FileType,
        Status: formData.Status,
    }),
};

const PhotoVideoGalleryManagement: React.FC = () => {
    return (
        <UniversalDataManagement<MediaItem>
            title="Photo & Video Gallery"
            listName="VideoGalleryLibrary"
            columns={columns}
            fields={fields}
            services={services}
            spContext={spContext}
            searchPlaceholder="Search files..."
            createButtonText="Upload New"
            drawerWidth={536}
            pageSize={5}
            className="photo-video-gallery-management"
        />
    );
};

export default PhotoVideoGalleryManagement;
