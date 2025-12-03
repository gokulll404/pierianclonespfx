
import * as React from 'react';
import  { useState } from 'react';
import { Modal, Avatar, Tag, Input, Row, Col, Typography, Space, Divider, Table } from 'antd';
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TeamOutlined,
  CrownOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import './BUHeadsDirectory.css';

const { Title, Text } = Typography;
const { Search } = Input;

interface BUHead {
  buHeadID: string;
  name: string;
  buName: string;
  designation: string;
  teamMemberCount: number;
  profilePicture: string;
  description: string;
  subBuName: string;
  department: string;
  status: string;
  emailID?: string;
  phone?: string;
  mobile?: string;
  jobLocation?: string;
  dateofJoining?: string;
}

interface IBUHeadsDirectory {
  buHeadsData: BUHead[];
}

const BUHeadsDirectory: React.FC<IBUHeadsDirectory> = ({ buHeadsData }) => {
  const [selectedBUHead, setSelectedBUHead] = useState<BUHead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);


  const query = (searchTerm ?? '').toLowerCase();

  const filteredBUHeads = buHeadsData.filter(buHead =>
  (
    (buHead.name ?? '').toLowerCase().includes(query) ||
    (buHead.designation ?? '').toLowerCase().includes(query)
  )
  );


  const openModal = (buHead: BUHead) => {
    setSelectedBUHead(buHead);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedBUHead(null);
  };

  const columns = [
    {
      title: 'Profile',
      dataIndex: 'profilePicture',
      key: 'profilePicture',
      width: 80,
      render: (profilePicture: string, record: BUHead) => (
        <Avatar
          size={50}
          src={profilePicture}
          icon={<CrownOutlined />}
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Business Unit',
      dataIndex: 'buName',
      key: 'buName',
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
    },
    {
      title: 'Team Size',
      dataIndex: 'teamMemberCount',
      key: 'teamMemberCount',
      render: (count: number) => `${count} Members`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: () => <Tag color="success">Active</Tag>,
    },
  ];

  return (
    <div className="bu-heads-employee-directory">
      {/* Header */}
      <div className="bu-heads-directory-header">
        <Title className="bu-heads-directory-title">
          {/* <CrownOutlined className="bu-heads-title-icon" /> */}
          Business Units
        </Title>
        <Text className="bu-heads-directory-subtitle">
          Meet our business units leaders
        </Text>

        {/* Search */}
        <div className="bu-heads-search-container">
          <Search
            placeholder="Search BU heads by name or designation..."
            allowClear
            size="large"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bu-heads-search-input"
          />
        </div>
      </div>

      {/* BU Heads Grid */}
      {/* BU Heads Table */}
      <Table
        columns={columns}
        dataSource={filteredBUHeads}
        rowKey="buHeadID"
        onRow={(record) => ({
          onClick: () => openModal(record),
          style: { cursor: 'pointer' },
        })}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} business unit heads`,
        }}
        scroll={{ x: 800 }}
      />


      {/* BU Head Detail Modal */}
      <Modal
        title={null}
        open={isModalVisible}
        onCancel={closeModal}
        footer={null}
        width={700}
        className="bu-heads-employee-modal"
      >
        {selectedBUHead && (
          <div>
            {/* Modal Header */}
            <div className="bu-heads-modal-header">
              <div className="bu-heads-modal-header-content">
                <Avatar
                  size={100}
                  src={selectedBUHead.profilePicture}
                  className="bu-heads-modal-avatar"
                  icon={<CrownOutlined />}
                />
                <div className="bu-heads-modal-employee-info">
                  <Title level={2} className="bu-heads-modal-employee-name">
                    {selectedBUHead.name}
                  </Title>
                  <Text className="bu-heads-modal-employee-designation">
                    {selectedBUHead.designation} | {selectedBUHead.buName}
                  </Text>
                  <div className="bu-heads-modal-tags">
                    <Tag className="bu-heads-modal-department-tag">
                      <TeamOutlined style={{ marginRight: 4 }} />
                      {selectedBUHead.teamMemberCount} Team Members
                    </Tag>
                    <Tag color="success" className="bu-heads-modal-status-tag">
                      Active
                    </Tag>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="bu-heads-modal-body">
              {/* About Section */}
              {selectedBUHead.description && (
                <>
                  <div className="bu-heads-modal-section">
                    <Title level={4} className="bu-heads-section-title">About</Title>
                    <Text className="bu-heads-about-text">
                      {selectedBUHead.description}
                    </Text>
                  </div>
                  <Divider />
                </>
              )}

              {/* Contact Info */}
              {(selectedBUHead.emailID || selectedBUHead.phone || selectedBUHead.mobile || selectedBUHead.jobLocation) && (
                <>
                  <div className="bu-heads-modal-section">
                    <Title level={4} className="bu-heads-section-title">Contact Information</Title>
                    <Row gutter={[16, 16]}>
                      {selectedBUHead.emailID && (
                        <Col span={12}>
                          <Space align="start">
                            <MailOutlined className="bu-heads-contact-icon" />
                            <div>
                              <div className="bu-heads-contact-label">Email</div>
                              <Text copyable className="bu-heads-contact-value">{selectedBUHead.emailID}</Text>
                            </div>
                          </Space>
                        </Col>
                      )}
                      {selectedBUHead.phone && (
                        <Col span={12}>
                          <Space align="start">
                            <PhoneOutlined className="bu-heads-contact-icon" />
                            <div>
                              <div className="bu-heads-contact-label">Phone</div>
                              <Text className="bu-heads-contact-value">{selectedBUHead.phone}</Text>
                            </div>
                          </Space>
                        </Col>
                      )}
                      {selectedBUHead.mobile && (
                        <Col span={12}>
                          <Space align="start">
                            <PhoneOutlined className="bu-heads-contact-icon" />
                            <div>
                              <div className="bu-heads-contact-label">Mobile</div>
                              <Text className="bu-heads-contact-value">{selectedBUHead.mobile}</Text>
                            </div>
                          </Space>
                        </Col>
                      )}
                      {selectedBUHead.jobLocation && (
                        <Col span={12}>
                          <Space align="start">
                            <EnvironmentOutlined className="bu-heads-contact-icon" />
                            <div>
                              <div className="bu-heads-contact-label">Location</div>
                              <Text className="bu-heads-contact-value">{selectedBUHead.jobLocation}</Text>
                            </div>
                          </Space>
                        </Col>
                      )}
                    </Row>
                  </div>
                  <Divider />
                </>
              )}

              {/* Work Info */}
              <div className="bu-heads-modal-section">
                <Title level={4} className="bu-heads-section-title">Leadership Information</Title>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Space align="start">
                      <TeamOutlined className="bu-heads-contact-icon" />
                      <div>
                        <div className="bu-heads-contact-label">Team Size</div>
                        <Text className="bu-heads-contact-value">{selectedBUHead.teamMemberCount} Members</Text>
                      </div>
                    </Space>
                  </Col>

                  {selectedBUHead.subBuName && (
                    <Col span={8}>
                      <Space align="start">
                        <ApartmentOutlined className="bu-heads-contact-icon" />
                        <div>
                          <div className="bu-heads-contact-label">Sub-BU Name</div>
                          <Text className="bu-heads-contact-value">{selectedBUHead.subBuName}</Text>
                        </div>
                      </Space>
                    </Col>
                  )}

                  {selectedBUHead.department && (
                    <Col span={8}>
                      <Space align="start">
                        <TeamOutlined className="bu-heads-contact-icon" />
                        <div>
                          <div className="bu-heads-contact-label">Department</div>
                          <Text className="bu-heads-contact-value">{selectedBUHead.department}</Text>
                        </div>
                      </Space>
                    </Col>
                  )}

                  {selectedBUHead.dateofJoining && (
                    <Col span={8}>
                      <Space align="start">
                        <CalendarOutlined className="bu-heads-contact-icon" />
                        <div>
                          <div className="bu-heads-contact-label">Joined</div>
                          <Text className="bu-heads-contact-value">
                            {new Date(selectedBUHead.dateofJoining).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Text>
                        </div>
                      </Space>
                    </Col>
                  )}
                </Row>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BUHeadsDirectory;