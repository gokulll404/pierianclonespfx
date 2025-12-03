import * as React from 'react';
import { spContext } from '../../../../App';
import UniversalDataManagement, {
    BaseDataItem,
    ColumnConfig,
    FieldConfig,
    ServiceConfig
} from '../../BasicComponents/UniversalDataManagement/Index';
import {
    addBUHead,
    deleteBUHead,
    deleteFileFromBUHeadsLibrary,
    getBUHeads,
    updateBUHead,
    uploadFileToBUHeadsLibraryAsync
} from '../../../../services/adminServices/BUHeadsServices/BUHeadsServices';

import { Tag } from 'antd';

// ================= IMAGE VALIDATION =================
const validateProfileDimensions = (file: File | null | undefined): Promise<string | null> => {
    if (!file) {
        return Promise.resolve('Image is required');
    }
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            const { width, height } = img;
            const minWidth = 200, maxWidth = 400;
            const minHeight = 200, maxHeight = 400;
            if (width < minWidth || width > maxWidth || height < minHeight || height > maxHeight) {
                resolve(`Image resolution must be between ${minWidth}×${minHeight} and ${maxHeight}×${maxHeight}. Current: ${width}×${height}`);
            } else {
                resolve(null);
            }
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve('Invalid image file');
        };
        img.src = url;
    });
};

// ================= TEXT VALIDATION =================
const validateText = (fieldName: string, maxLen: number) => (value: any): string | null => {
    if (!value || typeof value !== 'string') {
        return `${fieldName} is required`;
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        return `${fieldName} cannot be empty`;
    }
    if (trimmed.length > maxLen) {
        return `${fieldName} must not exceed ${maxLen} characters. Current: ${trimmed.length} characters`;
    }
    return null;
};

interface BUHeadItem extends BaseDataItem {
    id: number;
    buName: string;
    buHeadName: string;
    designation: string;
    image: string;
    description: string;
    teamMemberCount: number;
    status: 'publish' | 'unpublish' | 'draft';
}

const DEFAULT_IMAGE = 'https://via.placeholder.com/60x40/4A90E2/FFFFFF?text=User';

// ================= COLUMNS =================
const columns: ColumnConfig[] = [
    {
        key: 'image',
        title: 'Image',
        width: 80,
        render: (image: string) => (
            <img
                src={image || DEFAULT_IMAGE}
                alt="bu-head"
                style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '50%' }}
            />
        )
    },
    { key: 'buName', title: 'BU Name', width: 200, searchable: true },
    { key: 'subBuName', title: 'Sub-BU Name', width: 200 },
    { key: 'department', title: 'Department', width: 200 },
    { key: 'buHeadName', title: 'BU Head Name', width: 200 },
    { key: 'designation', title: 'Designation', width: 200 },
    { key: 'description', title: 'Description', width: 250 },
    { key: 'teamMemberCount', title: 'Team Members', width: 120 },
    {
        key: 'status',
        title: 'Status',
        width: 100,
        render: (status: string) => {
            const color =
                status === 'publish' ? 'green' :
                status === 'unpublish' ? 'red' : 'orange';
            return <Tag color={color}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>;
        }
    }
];

// ================= FIELDS =================
const fields: FieldConfig[] = [
    { key: 'image', label: 'Image (200x200 to 400x400)', type: 'file', accept: 'image/png,image/jpeg,image/jpg', required: true, validator: validateProfileDimensions },
    { key: 'buName', label: 'BU Name', type: 'text', required: true, validator: validateText('BU Name', 50), placeholder: 'Enter BU Name' },
    { key: 'subBuName', label: 'Sub-BU Name', type: 'text', required: false, placeholder: 'Enter Sub-BU Name (Optional)' },
    { key: 'department', label: 'Department', type: 'text', required: false, placeholder: 'Enter Department (Optional)' },
    { key: 'buHeadName', label: 'BU Head Name', type: 'text', required: true, validator: validateText('BU Head Name', 50), placeholder: 'Enter BU Head Name' },
    { key: 'designation', label: 'Designation', type: 'text', required: true, validator: validateText('Designation', 50), placeholder: 'Enter Designation' },
    { key: 'description', label: 'Description', type: 'textarea', required: false, placeholder: 'Enter Description (max 150 characters, Optional)' },
    { key: 'teamMemberCount', label: 'Team Member Count', type: 'number', required: true, placeholder: 'Enter Team Member Count' },
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

// ================= SERVICES =================
const services: ServiceConfig<BUHeadItem> = {
    fetchData: async (sp, listName) => {
        const items = await getBUHeads(sp, listName);
        return items ?? [];
    },  
    addData: async (sp, listName, data, file, pdfFile) => {
        await addBUHead(sp, listName, data);
    },
    updateData: async (sp, listName, id, data) => {
        await updateBUHead(sp, listName, parseInt(id as string), data);
    },
    deleteData: async (sp, listName, id) => {
        return await deleteBUHead(sp, listName, parseInt(id as string));
    },
    uploadFile: async (sp, library, fileInfo) => {
        const result = await uploadFileToBUHeadsLibraryAsync(sp, library, fileInfo);
        return result ?? '';
    },
    deleteFile: async (sp, fileUrl) => {
        return await deleteFileFromBUHeadsLibrary(sp, fileUrl);
    },
    mapResponseToData: (items: any[]): BUHeadItem[] => {
        return items.map((item: any) => ({
            id: item.ID || item.Id,
            buName: item.BUName || '',
            subBuName: item.SubBuName || '',
            buHeadName: item.BUHeadName || '',
            designation: item.Designation || '',
            department: item.Department || '',
            image: item.Image || '',
            description: item.Description || '',
            teamMemberCount: Number(item.TeamMemberCount) || 0,
            status: item.Status || 'draft'
        }));
    },
    mapFormDataToRequest: (formData: Partial<BUHeadItem>) => ({
        BUName: formData.buName,
        SubBuName: formData.subBuName,
        BUHeadName: formData.buHeadName,
        Designation: formData.designation,
        Department: formData.department,
        Image: formData.image,
        Description: formData.description,
        TeamMemberCount: formData.teamMemberCount?.toString().trim(),
        Status: formData.status || 'draft'
    })
};

// ================= COMPONENT =================
const BUHeadsManagement: React.FC = () => {
    return (
        <UniversalDataManagement<BUHeadItem>
            title="BU Heads"
            listName="BUHeadsDirectory"
            imageLibraryName="BUHeadPhotos"
            columns={columns}
            fields={fields}
            services={services}
            spContext={spContext}
            searchPlaceholder="Search BU Heads..."
            createButtonText="Create New"
            drawerWidth={536}
            pageSize={10}
            className="bu-heads-universal"
        />
    );
};

export default BUHeadsManagement;
