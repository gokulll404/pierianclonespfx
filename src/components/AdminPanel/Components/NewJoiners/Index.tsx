import * as React from 'react';
import { spContext } from '../../../../App';
import UniversalDataManagement, { BaseDataItem, ColumnConfig, FieldConfig, ServiceConfig } from '../../BasicComponents/UniversalDataManagement/Index';
import {
    getNewJoiners,
    addNewJoinee,
    updateNewJoinee,
    deleteNewJoinee,
} from '../../../../services/adminServices/NewJoinersServices/NewJoinersServices';
import { getEmployees } from '../../../../services/adminServices/EmployeeDirectoryServices/EmployeeDirectoryServices';
import { Tag } from 'antd';
import { dateFormat } from '../../../../utils/utils';


interface NewJoineeItem extends BaseDataItem {
    id: number;
    EmployeeID?: number;
    title: string;
    email: string;
    designation: string;
    department: string;
    userImage: string;
    joiningDate: string;
    status: 'publish' | 'unpublish' | 'draft';
}

const DEFAULT_IMAGE = 'https://via.placeholder.com/60x40/4A90E2/FFFFFF?text=User';

const NewJoinersManagement: React.FC = () => {
    const columns: ColumnConfig[] = [
        {
            key: 'userImage',
            title: 'Image',
            width: 80,
            render: (image: string) => (
                <img
                    src={image || DEFAULT_IMAGE}
                    alt="new-joinee"
                    className="image-universal-data-management"
                />
            )
        },
        {
            key: 'title',
            title: 'Employee Name',
            width: 200,
            searchable: true
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
            key: 'joiningDate',
            title: 'Joining Date',
            width: 140,
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
            key: 'EmployeeID',
            label: 'Select Employee',
            type: 'select',
            required: true,
            editingDisabled: true,
            isEmployeeField: true
        },
        // {
        //     key: 'joiningDate',
        //     label: 'Joining Date',
        //     type: 'date',
        //     required: true
        // },
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

    const services: ServiceConfig<NewJoineeItem> = {
        fetchData: async (sp, listName) => {
            const items = await getNewJoiners(sp, listName);
            return items ?? [];
        },

        addData: async (sp, listName, data, file, pdfFile) => {
            await addNewJoinee(sp, listName, data);
        },

        updateData: async (sp, listName, id, data, pdfFile) => {
            await updateNewJoinee(sp, listName, parseInt(id as string), data);
        },

        deleteData: async (sp, listName, id) => {
            return await deleteNewJoinee(sp, listName, parseInt(id as string));
        },

        fetchEmployees: async (sp: any, listName: string) => {
            const result = await getEmployees(sp, listName);
            return result ?? [];
        },

        mapEmployeesToSelectOptions: (employees: any[]): { value: string; label: string; Status: string }[] => {
            return employees.map((employee: any) => ({
                value: employee.EmployeeID?.toString() ?? '',
                label: employee.EmployeeName ?? '',
                Status: employee.Status
            }));
        },

        enrichDataWithEmployeeInfo: (items: NewJoineeItem[], employees: any[]): NewJoineeItem[] => {
            return items.map(item => {
                const itemEmpID = item?.EmployeeID?.toString();
                if (!itemEmpID) {
                    console.warn('Missing EmployeeID in item:', item);
                    return {
                        ...item,
                        title: '',
                        email: '',
                        designation: '',
                        department: '',
                        userImage: DEFAULT_IMAGE
                    };
                }

                const employee = employees.find(emp =>
                    emp?.EmployeeID?.toString() === itemEmpID
                );

                if (employee) {
                    return {
                        ...item,
                        title: employee.EmployeeName,
                        email: employee.EmailID || employee.Email,
                        designation: employee.Designation,
                        joiningDate: dateFormat(employee.DateofJoining),
                        department: employee.Department,
                        userImage: employee.ProfilePicture1 || DEFAULT_IMAGE
                    };
                }

                return {
                    ...item,
                    title: '',
                    email: '',
                    designation: '',
                    department: '',
                    userImage: DEFAULT_IMAGE
                };
            });
        },

        mapResponseToData: (items: any[]): NewJoineeItem[] => {
            return items.map((item: any) => ({
                id: item.ID || item.Id,
                EmployeeID: item.EmployeeID,
                title: '',
                email: '',
                designation: '',
                department: '',
                joiningDate: '',
                userImage: '',
                status: item.Status || 'draft'
            }));
        },

        mapFormDataToRequest: (formData: Partial<NewJoineeItem>) => {
            return {
                EmployeeID: formData.EmployeeID,
                Status: formData.status || 'draft'
            };
        }
    };

    return (
        <UniversalDataManagement<NewJoineeItem>
            title="New Joiners"
            listName="NewJoinee"
            employeeListName="EmployeeDirectory"
            columns={columns}
            fields={fields}
            services={services}
            spContext={spContext}
            searchPlaceholder="Search joiners..."
            createButtonText="Create New"
            drawerWidth={536}
            pageSize={10}
            className="new-joinee-universal"
        />
    );
};

export default NewJoinersManagement;
