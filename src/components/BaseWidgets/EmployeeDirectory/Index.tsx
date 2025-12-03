
import * as React from 'react';
import  { useState } from 'react';
import { Modal, Avatar, Tag, Input, Row, Col, Typography, Space, Divider, Table } from 'antd';
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
  IdcardOutlined,
  TeamOutlined,
  ApartmentOutlined,
  CrownOutlined
} from '@ant-design/icons';
import './EmployeeDirectory.css';

const { Title, Text } = Typography;
const { Search } = Input;

interface IEmployeeDir {
  listName?: string;
  employeesData: Employee[];
}

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
  gender: string;
  bu: string;
  jobLocation: string;
  profilePicture: string;
  isActive: boolean;
  status: string;
}

const EmployeeDirectory: React.FC<IEmployeeDir> = ({ employeesData, listName = 'EmployeeDirectory' }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);


  const query = (searchTerm ?? '').toLowerCase();

  const filteredEmployees = employeesData.filter(employee =>
    (employee.employeeName ?? '').toLowerCase().includes(query) ||
    (employee.designation ?? '').toLowerCase().includes(query) ||
    (employee.department ?? '').toLowerCase().includes(query)
  );

  const openModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedEmployee(null);
  };

  const columns = [
    {
      title: 'Profile',
      dataIndex: 'profilePicture',
      key: 'profilePicture',
      width: 80,
      render: (profilePicture: string, record: Employee) => (
        <Avatar
          size={50}
          src={profilePicture}
          icon={<UserOutlined />}
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'employeeName',
      key: 'employeeName',
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Business Unit',
      dataIndex: 'bu',
      key: 'bu',
    },
    {
      title: 'Location',
      dataIndex: 'jobLocation',
      key: 'jobLocation',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === "publish" ? 'success' : 'default'}>
          {status === "publish" ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
  ];


  return (
    <div className="employ-dir-employee-directory">
      {/* Header */}
      <div className="employ-dir-directory-header">
        {listName == "NewJoinee" ? <>
          <Title className="employ-dir-directory-title">
            <TeamOutlined className="employ-dir-title-icon" />
            New Joiners
          </Title>
          <Text className="employ-dir-directory-subtitle">
            Meet our new team members
          </Text>
        </> : <><Title className="employ-dir-directory-title">
          <TeamOutlined className="employ-dir-title-icon" />
          Employee Directory
        </Title>
          <Text className="employ-dir-directory-subtitle">
            Meet our talented team members
          </Text></>}

        {/* Search */}
        <div className="employ-dir-search-container">
          <Search
            placeholder="Search employees by name, position, or department..."
            allowClear
            size="large"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="employ-dir-search-input"
          />
        </div>
      </div>

      {/* Employee Table */}
      <Table
        columns={columns}
        dataSource={filteredEmployees}
        rowKey="employeeID"
        onRow={(record) => ({
          onClick: () => openModal(record),
          style: { cursor: 'pointer' },
        })}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} employees`,
          pageSizeOptions: ['10', '15', '20', '50'],
        }}
        scroll={{ x: 1000 }}
      />


      {/* Employee Detail Modal */}
      <Modal
        title={null}
        open={isModalVisible}
        onCancel={closeModal}
        footer={null}
        width={700}
        className="employ-dir-employee-modal"
      >
        {selectedEmployee && (
          <div>
            {/* Modal Header */}
            <div className="employ-dir-modal-header">
              <div className="employ-dir-modal-header-content">
                <Avatar
                  size={100}
                  src={selectedEmployee.profilePicture}
                  className="employ-dir-modal-avatar"
                />
                <div className="employ-dir-modal-employee-info">
                  <Title level={2} className="employ-dir-modal-employee-name">
                    {selectedEmployee.employeeName}
                  </Title>
                  {selectedEmployee.designation && (
                    <Text className="employ-dir-modal-employee-designation">
                      {selectedEmployee.designation}
                    </Text>
                  )}
                  <div className="employ-dir-modal-tags">
                    {selectedEmployee.department && (
                      <Tag className="employ-dir-modal-department-tag">
                        {selectedEmployee.department}
                      </Tag>
                    )}
                    <Tag color={selectedEmployee.status == "publish" ? 'success' : 'default'} className="employ-dir-modal-status-tag">
                      {selectedEmployee.status == "publish" ? 'Active' : 'Inactive'}
                    </Tag>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="employ-dir-modal-body">
              {/* About Me */}
              <div className="employ-dir-modal-section">
                <Title level={4} className="employ-dir-section-title">About Me</Title>

                <Row gutter={[16, 16]}>
                  {/* DOB */}
                  <Col span={8}>
                    <Space align="start">
                      <CalendarOutlined className="employ-dir-contact-icon" />
                      <div>
                        <div className="employ-dir-contact-label">DOB</div>
                        <Text className="employ-dir-contact-value">
                          {new Date(selectedEmployee.dateofBirth).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                      </div>
                    </Space>
                  </Col>

                  {/* Gender */}
                  <Col span={8}>
                    <Space align="start">
                      <UserOutlined className="employ-dir-contact-icon" />
                      <div>
                        <div className="employ-dir-contact-label">Gender</div>
                        <Text className="employ-dir-contact-value">
                          {selectedEmployee.gender || 'N/A'}
                        </Text>
                      </div>
                    </Space>
                  </Col>
                </Row>
              </div>

              <Divider />

              {/* Contact Info */}
              <div className="employ-dir-modal-section">
                <Title level={4} className="employ-dir-section-title">Contact Information</Title>
                <Row gutter={[16, 16]}>
                  {selectedEmployee.emailID && (
                    <Col span={12}>
                      <Space align="start">
                        <MailOutlined className="employ-dir-contact-icon" />
                        <div>
                          <div className="employ-dir-contact-label">Email</div>
                          <Text copyable className="employ-dir-contact-value">{selectedEmployee.emailID}</Text>
                        </div>
                      </Space>
                    </Col>
                  )}
                  {selectedEmployee.phone && (
                    <Col span={12}>
                      <Space align="start">
                        <PhoneOutlined className="employ-dir-contact-icon" />
                        <div>
                          <div className="employ-dir-contact-label">Phone</div>
                          <Text className="employ-dir-contact-value">{selectedEmployee.phone}</Text>
                        </div>
                      </Space>
                    </Col>
                  )}
                  {selectedEmployee.mobile && (
                    <Col span={12}>
                      <Space align="start">
                        <PhoneOutlined className="employ-dir-contact-icon" />
                        <div>
                          <div className="employ-dir-contact-label">Mobile</div>
                          <Text className="employ-dir-contact-value">{selectedEmployee.mobile}</Text>
                        </div>
                      </Space>
                    </Col>
                  )}
                  <Col span={12}>
                    <Space align="start">
                      <EnvironmentOutlined className="employ-dir-contact-icon" />
                      <div>
                        <div className="employ-dir-contact-label">Location</div>
                        <Text className="employ-dir-contact-value">{selectedEmployee.jobLocation}</Text>
                      </div>
                    </Space>
                  </Col>
                </Row>
              </div>

              <Divider />

              {/* Work Info */}

              <div className="employ-dir-modal-section">
                <Title level={4} className="employ-dir-section-title">Work Information</Title>
                <Row gutter={[16, 16]}>
                  {/* Employee ID */}
                  <Col span={8}>
                    <Space align="start">
                      <IdcardOutlined className="employ-dir-contact-icon" />
                      <div>
                        <div className="employ-dir-contact-label">Employee ID</div>
                        <Text className="employ-dir-work-value">{selectedEmployee.employeeID}</Text>
                      </div>
                    </Space>
                  </Col>

                  {/* Reporting Manager */}
                  <Col span={8}>
                    <Space align="start">
                      <UserOutlined className="employ-dir-contact-icon" />
                      <div>
                        <div className="employ-dir-contact-label">Reporting Manager</div>
                        <Text className="employ-dir-contact-value">{selectedEmployee.reportingManager}</Text>
                      </div>
                    </Space>
                  </Col>

                  {/* Date of Joining */}
                  <Col span={8}>
                    <Space align="start">
                      <CalendarOutlined className="employ-dir-contact-icon" />
                      <div>
                        <div className="employ-dir-contact-label">Joined</div>
                        <Text className="employ-dir-contact-value">
                          {new Date(selectedEmployee.dateofJoining).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                      </div>
                    </Space>
                  </Col>

                  {/* Business Unit */}
                  <Col span={8}>
                    <Space align="start">
                      <ApartmentOutlined className="employ-dir-contact-icon" />
                      <div>
                        <div className="employ-dir-contact-label">Business Unit</div>
                        <Text className="employ-dir-contact-value">{selectedEmployee.bu}</Text>
                      </div>
                    </Space>
                  </Col>

                  {/* Designation */}
                  <Col span={8}>
                    <Space align="start">
                      <CrownOutlined className="employ-dir-contact-icon" />
                      <div>
                        <div className="employ-dir-contact-label">Designation</div>
                        <Text className="employ-dir-contact-value">{selectedEmployee.designation}</Text>
                      </div>
                    </Space>
                  </Col>

                  {/* Department */}
                  <Col span={8}>
                    <Space align="start">
                      <TeamOutlined className="employ-dir-contact-icon" />
                      <div>
                        <div className="employ-dir-contact-label">Department</div>
                        <Text className="employ-dir-contact-value">{selectedEmployee.department}</Text>
                      </div>
                    </Space>
                  </Col>

                  {/* Job Location */}
                  <Col span={8}>
                    <Space align="start">
                      <EnvironmentOutlined className="employ-dir-contact-icon" />
                      <div>
                        <div className="employ-dir-contact-label">Job Location</div>
                        <Text className="employ-dir-contact-value">{selectedEmployee.jobLocation}</Text>
                      </div>
                    </Space>
                  </Col>
                </Row>
              </div>


              <Divider />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeDirectory;

