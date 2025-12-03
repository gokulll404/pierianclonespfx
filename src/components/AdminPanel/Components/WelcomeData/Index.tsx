import * as React from 'react';
import { Tag } from 'antd';
import { spContext } from '../../../../App';
import UniversalDataManagement, { BaseDataItem, ColumnConfig, FieldConfig, ServiceConfig } from '../../BasicComponents/UniversalDataManagement/Index';
import {
  getWelcomeDataItems,
  addWelcomeDataItem,
  updateWelcomeDataItem,
  deleteWelcomeDataItem,
  deleteWelcomeDataImage
} from '../../../../services/adminServices/WelcomeDaraService/WelcomeDataService';
import { getEmployees } from '../../../../services/adminServices/EmployeeDirectoryServices/EmployeeDirectoryServices';

interface WelcomeDataItem extends BaseDataItem {
  id: number;
  EmployeeID: number;
  EmployeeName: string;
  Image: string;
  status: 'publish' | 'unpublish' | 'draft';
}

const WelcomeDataManagement: React.FC = () => {

  const columns: ColumnConfig[] = [
    {
      key: 'Image',
      title: 'Image',
      width: 80,
      render: (image: string) => (
        <img
          src={image || 'https://via.placeholder.com/60x40/4A90E2/FFFFFF?text=User'}
          alt="Employee"
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
      key: 'status',
      title: 'Status',
      width: 100,
      render: (status: string) => {
        const color = status === 'publish' ? 'green' : status === 'unpublish' ? 'red' : 'orange';
        return <Tag color={color}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>;
      }
    }
  ];

  const fields: FieldConfig[] = [
    {
      key: 'EmployeeID', // ✅ Changed from EmployeeName to EmployeeID
      label: 'Select Employee',
      type: 'select',
      required: true,
      editingDisabled: true,
      isEmployeeField: true, // ✅ Mark this as an employee field
      placeholder:'Select Employee',
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

  const services: ServiceConfig<WelcomeDataItem> = {
    fetchData: async (sp: any, listName: string) => {
      const items = await getWelcomeDataItems(sp, listName);
      return items ?? [];
    },
    addData: async (sp: any, listName: string, data: any, file?: any, pdfFile?: File | null) => {
      await addWelcomeDataItem(sp, listName, data);
    },
    updateData: async (sp: any, listName: string, id: any, data: any, pdfFile?: File | null) => {
      await updateWelcomeDataItem(sp, listName, id, data);
    },
    deleteData: async (sp: any, listName: string, id: number) => {
      return await deleteWelcomeDataItem(sp, listName, id);
    },
    deleteFile: async (sp: any, fileUrl: string) => {
      return await deleteWelcomeDataImage(sp, fileUrl);
    },
    
    // ✅ New employee-related methods
    fetchEmployees: async (sp: any, listName: string) => {
      const result = await getEmployees(sp, listName);
      return result ?? [];
    },
    
    mapEmployeesToSelectOptions: (employees: any[]): { value: string; label: string; Status:string }[] => {
      return employees.map((employee: any) => ({
        value: employee.EmployeeID.toString(),
        label: employee.EmployeeName,
        Status: employee.Status
      }));
    },
    
    enrichDataWithEmployeeInfo: (items: WelcomeDataItem[], employees: any[]): WelcomeDataItem[] => {
      return items.map(item => {
        const employee = employees.find(emp => emp.EmployeeID.toString() === item.EmployeeID.toString());
        if (employee) {
          return {
            ...item,
            EmployeeName: employee.EmployeeName,
            Image: item.Image || employee.ProfilePicture1 || 'https://via.placeholder.com/60x40/4A90E2/FFFFFF?text=User'
          };
        }
        return item;
      });
    },

    mapResponseToData: (items: any[]): WelcomeDataItem[] => {
      return items.map((item: any) => ({
        id: item.ID || item.id,
        EmployeeID: item.EmployeeID,
        EmployeeName: '',
        Image: item.Image || '',
        status: item.Status || 'draft'
      }));
    },
    
    mapFormDataToRequest: (formData: Partial<WelcomeDataItem>) => {
      return {
        EmployeeID: formData.EmployeeID,
        Image: formData.Image || '',
        Status: formData.status || 'draft'
      };
    }
  };

  return (
    <>
      <UniversalDataManagement<WelcomeDataItem>
        title="Welcome Data"
        listName="EmployeeOnboard"
        imageLibraryName="EmployeeOnboard"
        employeeListName="EmployeeDirectory" // ✅ Specify the employee list name
        columns={columns}
        fields={fields}
        services={services}
        spContext={spContext}
        searchPlaceholder="Search employee..."
        createButtonText="Create New"
        drawerWidth={536}
        pageSize={10}
        className="welcome-data-universal"
      />
    </>
  );
};

export default WelcomeDataManagement;