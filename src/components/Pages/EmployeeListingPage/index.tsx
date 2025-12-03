import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import './EmployeeListingPage.css';
import { spContext } from '../../../App';
import EmployeeDirectory from '../../BaseWidgets/EmployeeDirectory/Index';
import { getBUHeadsDirectory, getEmployeeListingData, getNewJoiners } from '../../../services/service';
import BUHeadsDirectory from '../../BaseWidgets/BUHeadsDirectory/Index';

interface Employee {
  employeeID: string;
  employeeName: string;
  designation: string;
  department: string;
  emailID: string;
  phone: string;
  mobile?: string;
  reportingManager: string;
  dateofJoining: string;
  dateofBirth: string;
  jobLocation: string;
  profilePicture: string;
  bu: string;
  gender: string;
  isActive: boolean;
  status: string;
}

interface BUHead {
  buHeadID: string;
  name: string;
  subBuName: string;
  department: string;
  designation: string;
  teamMemberCount: number;
  profilePicture: string;
  description: string;
  buName: string;
  status: string;
}

interface EmployeeListingPageProps {
  listName?: 'EmployeeDirectory' | 'BUHeadsDirectory' | 'NewJoinee';
}

const EmployeeListingPage: React.FC<EmployeeListingPageProps> = ({
  listName = 'EmployeeDirectory'
}) => {
  const { sp } = useContext(spContext);

  const [employeeData, setEmployeeData] = useState<Employee[]>([]);
  const [buHeadsData, setBUHeadsData] = useState<BUHead[]>([]);
  const [newJoineeData, setNewJoineeData] = useState<Employee[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let items;

        if (listName === 'EmployeeDirectory') {
          items = await getEmployeeListingData(sp, 'EmployeeDirectory');

          if (items) {
            const mappedItems: Employee[] = items.map((item: any) => ({
              isActive: item.IsActive,
              employeeID: item.UserID,
              employeeName: item.EmployeeName,
              emailID: item.EmailID,
              dateofBirth: item.DateofBirth,
              dateofJoining: item.DateofJoining,
              department: item.Department,
              reportingManager: item.ReportingManager,
              designation: item.Designation,
              gender: item.Gender,
              bu: item.BU,
              jobLocation: item.JobLocation,
              profilePicture: item.ProfilePicture1,
              mobile: item.Mobile,
              phone: item.Phone,
              status: item.Status
            })) ?? [];

            mappedItems.sort((a, b) =>
              a.employeeName.localeCompare(b.employeeName, undefined, { sensitivity: 'base' })
            );

            setEmployeeData(mappedItems);
          }
        } else if (listName === 'BUHeadsDirectory') {
          items = await getBUHeadsDirectory(sp, 'BUHeadsDirectory'); // Assuming different list name

          if (items) {
            const mappedItems: BUHead[] = items.map((item: any) => ({
              buHeadID: item.Id || item.ID,
              name: item.BUHeadName || 'employee',
              buName: item.BUName || 'BU Name',
              subBuName: item.SubBuName || null,
              designation: item.Designation || null,
              department: item.Department || null,
              teamMemberCount: Number(item.TeamMemberCount) || 0,
              profilePicture: item.Image || '',
              description: item.Description || '',
              gender: item.Gender || '',
              bu: item.BU || '',
              status: item.Status
            })) ?? [];

            mappedItems.sort((a, b) =>
              a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
            );

            setBUHeadsData(mappedItems);
          }
        } else if (listName === 'NewJoinee') {
          items = await getNewJoiners(sp, 'NewJoinee');

          if (items) {
            const mappedItems: Employee[] = items.map((item: any) => ({
              isActive: item.IsActive,
              employeeID: item.UserID,
              employeeName: item.EmployeeName,
              emailID: item.EmailID,
              dateofBirth: item.DateofBirth,
              dateofJoining: item.DateofJoining,
              department: item.Department,
              reportingManager: item.ReportingManager,
              designation: item.Designation,
              jobLocation: item.JobLocation,
              profilePicture: item.UserImage,
              gender: item.Gender,
              bu: item.BU,
              mobile: item.Mobile,
              phone: item.Phone,
              status: item.Status
            })) ?? [];

            setNewJoineeData(mappedItems);
          }
        }

      } catch (error) {
        console.error("Failed to load list data:", error);
      }
    };

    fetchData();
  }, [listName, sp]);

  const renderContent = () => {
    if (listName === 'BUHeadsDirectory') {
      return <BUHeadsDirectory buHeadsData={buHeadsData} />;
    } else if (listName === 'NewJoinee') {
      return <EmployeeDirectory employeesData={newJoineeData} listName={listName} />;
    }

    // Default to EmployeeDirectory
    return <EmployeeDirectory employeesData={employeeData} />;
  };

  return (
    <div className='employ-listing-page-outer-div'>
      {renderContent()}
    </div>
  );
};

export default EmployeeListingPage;