import * as React from 'react';
import { spContext } from '../../../../App';
import UniversalDataManagement, { BaseDataItem, ColumnConfig, FieldConfig, ServiceConfig } from '../../BasicComponents/UniversalDataManagement/Index';
import {
    addEmployeeData,
    updateEmployeeData,
    deleteEmployeeData,
    deleteEmployeePhotoAsync,
    getEmployees,
} from '../../../../services/adminServices/EmployeeDirectoryServices/EmployeeDirectoryServices';
import { dateFormat } from '../../../../utils/utils';
import { Tag } from 'antd';
import * as dayjs from 'dayjs';

interface EmployeeItem extends BaseDataItem {
    ID: number;
    employeeName: string;
    employeeId: string;
    emailId: string;
    mobile: string;
    designation: string;
    bu: string;
    department: string;
    reportingManager: string;
    jobLocation: string;
    gender: string;
    image: string;
    dateofJoining: string;
    dateOfBirth: string;
    isActive: boolean;
    status: string;
}

// ✅ Image validation
const validateProfileDimensions = (file: File | null | undefined): Promise<string | null> => {
    if (!file) return Promise.resolve('Image is required');

    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            const { width, height } = img;

            const minWidth = 200, maxWidth = 400;
            const minHeight = 200, maxHeight = 400;

            if (width < minWidth || width > maxWidth || height < minHeight || height > maxHeight) {
                resolve(`Image resolution must be between ${minWidth}×${minHeight} and ${maxWidth}×${maxHeight}. Current: ${width}×${height}`);
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

// ✅ Field validation helpers
const validateName = (value: any): string | null => {
    if (!value || typeof value !== 'string') return 'Name is required';
    const trimmed = value.trim();
    if (!trimmed) return 'Name cannot be empty';
    if (trimmed.length > 60) return `Name must not exceed 60 characters. Current: ${trimmed.length}`;
    return null;
};

const validateID = (value: any): string | null => {
    if (!value || typeof value !== 'string') return 'Employee ID is required';
    const trimmed = value.trim();
    if (!trimmed) return 'Employee ID cannot be empty';
    if (trimmed.length > 60) return `Employee ID must not exceed 60 characters. Current: ${trimmed.length}`;
    return null;
};

const validateEmail = (value: any): string | null => {
    if (!value || typeof value !== 'string') return 'Email is required';
    const pattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,63}(\.[a-zA-Z]{2,63})?$/;
    return pattern.test(value) ? null : 'Please enter a valid email address';
};

const validateMobileNumber = (value: any): string | null => {
    if (!value || typeof value !== 'string') return 'Mobile Number is required';
    const trimmed = value.trim();
    if (!trimmed) return 'Mobile Number cannot be empty';
    if (!/^\d{10}$/.test(trimmed)) return 'Mobile Number must be exactly 10 digits';
    return null;
};

const validateDesignation = (value: any): string | null => {
    if (!value || typeof value !== 'string') return 'Designation is required';
    const trimmed = value.trim();
    if (!trimmed) return 'Designation cannot be empty';
    if (trimmed.length > 60) return `Designation must not exceed 60 characters. Current: ${trimmed.length}`;
    return null;
};

const validateDepartment = (value: any): string | null => {
    if (!value || typeof value !== 'string') return 'Department is required';
    const trimmed = value.trim();
    if (!trimmed) return 'Department cannot be empty';
    if (trimmed.length > 60) return `Department must not exceed 60 characters. Current: ${trimmed.length}`;
    return null;
};

const validateReportingManager = (value: any): string | null => {
    if (!value || typeof value !== 'string') return 'ReportingManager is required';
    const trimmed = value.trim();
    if (!trimmed) return 'ReportingManager cannot be empty';
    if (trimmed.length > 60) return `ReportingManager must not exceed 60 characters. Current: ${trimmed.length}`;
    return null;
};

const validateJobLocation = (value: any): string | null => {
    if (!value || typeof value !== 'string') return 'Job Location is required';
    const trimmed = value.trim();
    if (!trimmed) return 'Job Location cannot be empty';
    if (trimmed.length > 60) return `Job Location must not exceed 60 characters. Current: ${trimmed.length}`;
    return null;
};

const validateDateOfBirth = (value: any): string | null => {
    if (!value) return 'Date of Birth is required';

    const date = new Date(value);
    if (isNaN(date.getTime())) return 'Invalid Date of Birth';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date > today) {
        return 'Date of Birth cannot be in the future';
    }

    return null;
};

// ✅ Table columns
const columns: ColumnConfig[] = [
    {
        key: 'image',
        title: 'Profile Picture',
        width: 100,
        render: (image: string) => (
            <img
                src={image}
                alt="profile"
                style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '50%' }}
            />
        ),
    },
    { key: 'employeeName', title: 'Name', width: 180, searchable: true },
    { key: 'employeeId', title: 'Employee ID', width: 120 },
    { key: 'emailId', title: 'Email', width: 180 },
    { key: 'mobile', title: 'Mobile No.', width: 120 },
    { key: 'designation', title: 'Designation', width: 160 },
    { key: 'bu', title: 'BU', width: 160 },
    { key: 'department', title: 'Department', width: 160 },
    { key: 'reportingManager', title: 'Reporting Manager', width: 200 },
    { key: 'jobLocation', title: 'Job Location', width: 160 },
    { key: 'gender', title: 'Gender', width: 120 },
    { key: 'dateofJoining', title: 'Date of Joining', width: 160 },
    { key: 'dateOfBirth', title: 'Date of Birth', width: 160 },
    {
        key: 'status',
        title: 'Status',
        width: 100,
        render: (status: string) => {
            const color = status === 'publish' ? 'green' : status === 'unpublish' ? 'red' : 'orange';
            return <Tag color={color}>{status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}</Tag>;
        },
    },
];

// ✅ Form fields
const fields: FieldConfig[] = [
    { key: 'image', label: 'Profile Picture (200x200 to 400x400)', type: 'file', required: false, accept: 'image/png,image/jpeg,image/jpg', validator: validateProfileDimensions },
    { key: 'employeeName', label: 'Employee Name', type: 'text', required: true, validator: validateName, placeholder: 'Enter Employee Name (max 60 characters)' },
    {
        key: 'gender',
        label: 'Gender',
        type: 'radio',
        required: true,
        options: [
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
            { value: 'Other', label: 'Other' },
        ],
    },
    { key: 'employeeId', label: 'Employee ID', type: 'text', required: true, validator: validateID, placeholder: 'Enter Employee ID (max 60 characters)' },
    { key: 'emailId', label: 'Email', type: 'text', required: true, validator: validateEmail, placeholder: 'Enter Email ID' },
    { key: 'mobile', label: 'Mobile No.', type: 'text', required: true, validator: validateMobileNumber, placeholder: 'Enter Mobile Number (10 digits)' },
    { key: 'designation', label: 'Designation', type: 'text', required: true, validator: validateDesignation, placeholder: 'Enter Designation (max 60 characters)' },
    { key: 'bu', label: 'BU', type: 'text', required: true, validator: validateDepartment, placeholder: 'Enter BU (max 60 characters)' },
    { key: 'department', label: 'Department', type: 'text', required: true, validator: validateDepartment, placeholder: 'Enter Department (max 60 characters)' },
    { key: 'reportingManager', label: 'Reporting Manager', type: 'text', required: true, validator: validateReportingManager, placeholder: 'Enter Reporting Manager (max 60 characters)' },
    { key: 'jobLocation', label: 'Job Location', type: 'text', required: true, validator: validateJobLocation, placeholder: 'Enter Job Location (max 60 characters)' },
    { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, validator: validateDateOfBirth, placeholder: 'Enter Date of Birth' },
    { key: 'dateofJoining', label: 'Date of Joining', type: 'date', required: true, placeholder: 'Enter Date of Joining' },
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

// ✅ Services using refactored Employee Service
const services: ServiceConfig<EmployeeItem> = {
    fetchData: async (sp, listName) => {
        const items = await getEmployees(sp, listName);
        return items ?? [];
    },
    addData: async (sp, listName, data, file?, pdfFile?) => {
        await addEmployeeData(sp, listName, data);
    },
    updateData: async (sp, listName, id, data) => {
        await updateEmployeeData(sp, listName, id, data);
    },
    deleteData: async (sp, listName, id) => {
        return await deleteEmployeeData(sp, listName, id, ['NewJoinee', 'EmployeeOnboard', 'RecogonizedEmployee']);
    },
    
    deleteFile: async (sp, fileUrl) => {
        return await deleteEmployeePhotoAsync(sp, fileUrl);
    },
    mapResponseToData: (items: any[]): EmployeeItem[] =>
        items.map((item) => ({
            id: item.Id,
            ID: item.Id,
            employeeName: item.EmployeeName || '',
            employeeId: item.EmployeeID || '',
            emailId: item.EmailID || '',
            mobile: item.Mobile || '',
            designation: item.Designation || '',
            bu: item.BU || '',
            department: item.Department || '',
            reportingManager: item.ReportingManager || '',
            jobLocation: item.JobLocation || '',
            gender: item.Gender || '',
            image: item.ProfilePicture1 || '',
            dateofJoining: dateFormat(item.DateofJoining) || '',
            dateOfBirth: dateFormat(item.DateofBirth) || '',
            isActive: item.IsActive ?? false,
            status: item.Status || 'draft',
        })),
    mapFormDataToRequest: (formData: Partial<EmployeeItem>) => ({
        Title: formData.employeeName,
        EmployeeName: formData.employeeName,
        EmployeeID: formData.employeeId,
        UserID: formData.employeeId,
        EmailID: formData.emailId,
        Mobile: formData.mobile,
        Designation: formData.designation,
        BU: formData.bu,
        Department: formData.department,
        ReportingManager: formData.reportingManager,
        JobLocation: formData.jobLocation,
        Gender: formData.gender,
        ProfilePicture1: formData.image,
        DateofJoining: dayjs(formData.dateofJoining).utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
        DateofBirth: dayjs(formData.dateOfBirth).utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
        IsActive: formData.isActive,
        Status: formData.status || 'draft',
    }),
};

const EmployeeDirectoryManagement: React.FC = () => {
    return (
        <UniversalDataManagement<EmployeeItem>
            title="Employee Directory"
            listName="EmployeeDirectory"
            imageLibraryName="UserPhotos"
            columns={columns}
            fields={fields}
            services={services}
            spContext={spContext}
            searchPlaceholder="Search employees..."
            createButtonText="Add Employee"
            drawerWidth={536}
            pageSize={10}
            className="employee-directory-universal"
        />
    );
};

export default EmployeeDirectoryManagement;
