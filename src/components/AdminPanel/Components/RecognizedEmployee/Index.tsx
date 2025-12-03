import * as React from 'react';
import { Tag } from 'antd';
import { spContext } from '../../../../App';
import UniversalDataManagement, { BaseDataItem, ColumnConfig, FieldConfig, ServiceConfig } from '../../BasicComponents/UniversalDataManagement/Index';
import {
    getRecognizedEmployees,
    addRecognizedEmployee,
    updateRecognizedEmployee,
    deleteRecognizedEmployee
} from '../../../../services/adminServices/RecognizedEmployeeServices/RecognizedEmployeeServices';
import { getEmployees } from '../../../../services/adminServices/EmployeeDirectoryServices/EmployeeDirectoryServices';
import { dateFormat } from '../../../../utils/utils';
import * as dayjs from 'dayjs';

interface RecognizedEmployeeItem extends BaseDataItem {
    id: number;
    EmployeeID: number;
    EmployeeName: string;
    description: string;
    recognitionDate: string;
    email?: string;
    designation?: string;
    department?: string;
    image?: string;
    status: 'publish' | 'unpublish' | 'draft';

    // ✅ New fields
    recognizedBy: string;
    recognizedByDesignation: string;
    recognizedByCompanyName: string;
}

// Title validation function
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

const validateRecognizedBy = (value: any): string | null => {
    if (!value || typeof value !== 'string') {
        return 'Appreciated By is required';
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
        return 'Appreciated By cannot be empty';
    }

    if (trimmedValue.length > 60) {
        return `Appreciated By must not exceed 60 characters. Current: ${trimmedValue.length} characters`;
    }

    return null;
};

const validateRecognizedByDesignation = (value: any): string | null => {
    if (!value || typeof value !== 'string') {
        return 'Appreciator Designation is required';
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
        return 'Appreciator Designation cannot be empty';
    }

    if (trimmedValue.length > 60) {
        return `Appreciator Designation must not exceed 60 characters. Current: ${trimmedValue.length} characters`;
    }

    return null;
};

const validateRecognizedByCompanyName = (value: any): string | null => {
    if (!value || typeof value !== 'string') {
        return 'Appreciator Company is required';
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
        return 'Appreciator Company cannot be empty';
    }

    if (trimmedValue.length > 60) {
        return `Appreciator Company must not exceed 60 characters. Current: ${trimmedValue.length} characters`;
    }

    return null;
};


const RecognizedEmployeeManagement: React.FC = () => {
    const columns: ColumnConfig[] = [
        {
            key: 'image',
            title: 'Image',
            width: 80,
            render: (image: string) => (
                <img
                    src={image || 'https://via.placeholder.com/60x40/4A90E2/FFFFFF?text=User'}
                    alt="recognized-employee"
                    className="image-universal-data-management"
                />
            )
        },
        {
            key: 'EmployeeName',
            title: 'Employee Name',
            width: 200,
            searchable: true
        },
        {
            key: 'description',
            title: 'Appreciator Note',
            width: 200,
            searchable: true,
        },
        {
            key: 'recognizedBy',
            title: 'Appreciated By',
            width: 160,
        },
        {
            key: 'recognizedByDesignation',
            title: 'Appreciator Designation',
            width: 180,
        },
        {
            key: 'recognizedByCompanyName',
            title: 'Appreciator Company',
            width: 180,
        },
        {
            key: 'email',
            title: 'Email',
            width: 180
        },
        {
            key: 'designation',
            title: 'Designation',
            width: 180
        },
        {
            key: 'department',
            title: 'Department',
            width: 120
        },
        {
            key: 'recognitionDate',
            title: 'Recognition Date',
            width: 140,
        },
        {
            key: 'status',
            title: 'Status',
            width: 100,
            render: (status: string) => {
                const color =
                    status === 'publish' ? 'green' : status === 'unpublish' ? 'red' : 'orange';
                return <Tag color={color}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>;
            }
        }
    ];

    const fields: FieldConfig[] = [
        {
            key: 'EmployeeID',
            label: 'Select Employee',
            type: 'select',
            required: true,
            editingDisabled: true,
            isEmployeeField: true,
            placeholder: 'Select Employee'
        },
        {
            key: 'recognizedBy',
            label: 'Appreciated By',
            type: 'text',
            required: true,
            placeholder: 'Enter person/client who Appreciated',
            validator: validateRecognizedBy
        },
        {
            key: 'recognizedByDesignation',
            label: 'Appreciator Designation',
            type: 'text',
            required: true,
            placeholder: 'Enter designation of Appreciator',
            validator: validateRecognizedByDesignation
        },
        {
            key: 'recognizedByCompanyName',
            label: 'Appreciator Company',
            type: 'text',
            required: true,
            placeholder: 'Enter company name of Appreciator',
            validator: validateRecognizedByCompanyName
        },
        {
            key: 'description',
            label: 'Appreciator Note',
            type: 'textarea',
            required: true,
            validator: validateDescription,
            placeholder: 'Enter Appreciator Note (max 550 characters)',
        },
        {
            key: 'recognitionDate',
            label: 'Recognition Date',
            type: 'date',
            required: true
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

    const services: ServiceConfig<RecognizedEmployeeItem> = {
        fetchData: async (sp, listName) => {
            const items = await getRecognizedEmployees(sp, listName);
            return items ?? [];
        },
        addData: async (sp, listName, data, file?, pdfFile?) => {
            await addRecognizedEmployee(sp, listName, data);
        },
        updateData: async (sp, listName, id, data, pdfFile?) => {
            await updateRecognizedEmployee(sp, listName, parseInt(id as string), data);
        },
        deleteData: async (sp, listName, id) => {
            return await deleteRecognizedEmployee(sp, listName, parseInt(id as string));
        },

        fetchEmployees: async (sp: any, listName: string) => {
            const result = await getEmployees(sp, listName);
            return result ?? [];
        },

        mapEmployeesToSelectOptions: (employees: any[]): { value: string; label: string; Status:string }[] => {
            return employees.map((employee: any) => ({
                value: employee.EmployeeID?.toString() ?? '',
                label: employee.EmployeeName,
                Status: employee.Status
            }));
        },

        enrichDataWithEmployeeInfo: (items: RecognizedEmployeeItem[], employees: any[]): RecognizedEmployeeItem[] => {
            return items.map(item => {
                const itemId = item?.EmployeeID?.toString();
                if (!itemId) return item;

                const employee = employees.find(emp =>
                    emp?.EmployeeID != null &&
                    emp.EmployeeID.toString() === itemId
                );

                if (employee) {
                    return {
                        ...item,
                        EmployeeName: employee.EmployeeName,
                        email: employee.EmailID || employee.Email,
                        designation: employee.Designation,
                        department: employee.Department,
                        image: item.image || employee.ProfilePicture1 || 'https://via.placeholder.com/60x40/4A90E2/FFFFFF?text=User'
                    };
                }
                return item;
            });
        },

        mapResponseToData: (items: any[]): RecognizedEmployeeItem[] => {
            return items.map((item: any) => ({
                id: item.ID || item.id,
                EmployeeID: item.EmployeeID,
                EmployeeName: '',
                description: item.RecogonitionDescription || item.RecognitionDescription,
                recognitionDate: dateFormat(item.RecogonitionDate) || item.RecognitionDate,
                recognizedBy: item.RecognizedBy || '',
                recognizedByDesignation: item.RecognizedByDesignation || '',
                recognizedByCompanyName: item.RecognizedByCompanyName || '',
                email: '',
                designation: '',
                department: '',
                image: item.Image || '',
                status: item.Status || 'draft'
            }));
        },

        mapFormDataToRequest: (formData: Partial<RecognizedEmployeeItem>) => {
            return {
                EmployeeID: formData.EmployeeID,
                RecogonitionDescription: formData.description,
                RecogonitionDate: dayjs(formData.recognitionDate).utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
                RecognizedBy: formData.recognizedBy,
                RecognizedByDesignation: formData.recognizedByDesignation,
                RecognizedByCompanyName: formData.recognizedByCompanyName,
                Status: formData.status || 'draft'
            };
        }
    };

    return (
        <UniversalDataManagement<RecognizedEmployeeItem>
            title="Recognized Employee"
            listName="RecogonizedEmployee"
            employeeListName="EmployeeDirectory"
            columns={columns}
            fields={fields}
            services={services}
            spContext={spContext}
            searchPlaceholder="Search employees..."
            createButtonText="Create New"
            drawerWidth={536}
            pageSize={10}
            className="recognized-employee-universal"
        />
    );
};

export default RecognizedEmployeeManagement;
