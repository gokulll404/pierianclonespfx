import * as React from 'react';
import { useRef, useState, useCallback, useMemo, useContext, useEffect } from 'react';
import { Table, Button, Input, Drawer, message, Modal, Select, Radio, DatePicker, TimePicker } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined,
  UploadOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './UniversalDataManagement.css';
import * as moment from "moment";


const { Option } = Select;

// Types for configuration
export interface BaseDataItem {
  id: number;
  [key: string]: any;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'date' | 'time' | 'dateTime' | 'file' | 'custom' | 'number' | 'mediaFile' | 'pdfFile';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  accept?: string; // For file inputs
  multiple?: boolean;
  rows?: number; // For textarea
  render?: (value: any, record: BaseDataItem) => React.ReactNode; // Custom render function
  validator?: (value: any) => string | null | Promise<string | null>;
  editingDisabled?: boolean;
  isEmployeeField?: boolean;
  fileTypeField?: string; // For mediaFile type - field that determines file type
  fileNameField?: string; // For mediaFile type - field that stores file name
  autoDetectType?: boolean; // Auto detect file type from uploaded file
}

export interface ColumnConfig {
  key: string;
  title: string;
  width?: number;
  render?: (value: any, record: BaseDataItem) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
}

export interface ServiceConfig<T extends BaseDataItem> {
  fetchData: (sp: any, listName: string) => Promise<any[]>;
  addData: (sp: any, listName: string, data: any, file?: any, pdfFile?: File | null) => Promise<void>;
  updateData: (sp: any, listName: string, id: any, data: any, pdfFile?: File | null) => Promise<void>;
  deleteData: (sp: any, listName: string, id: any) => Promise<void>;
  clearColumnIfNoData?: (sp: any, listName: string, id: any) => Promise<void>;
  uploadFile?: (sp: any, libraryName: string, fileInfo: any) => Promise<string>;
  deleteFile?: (sp: any, fileUrl: string) => Promise<void>;
  mapResponseToData: (items: any[]) => T[];
  mapFormDataToRequest: (formData: Partial<T>) => any;
  fetchEmployees?: (sp: any, listName: string) => Promise<any[]>;
  mapEmployeesToSelectOptions?: (items: any[]) => { value: string; label: string; Status: string }[];
  enrichDataWithEmployeeInfo?: (items: T[], employees: any[]) => T[];
}

export interface UniversalDataManagementProps<T extends BaseDataItem> {
  title: string;
  listName: string;
  imageLibraryName?: string;
  columns: ColumnConfig[];
  fields: FieldConfig[];
  services: ServiceConfig<T>;
  spContext: React.Context<{ sp: any }>;
  defaultImage?: string;
  searchPlaceholder?: string;
  createButtonText?: string;
  drawerWidth?: number;
  pageSize?: number;
  className?: string;
  employeeListName?: string;
}

interface FileInfo {
  name: string;
  file: any;
  previewUrl: string;
  size: string;
  type?: 'image' | 'video' | 'pdf' | 'other';
}

const UniversalDataManagement = <T extends BaseDataItem>({
  title,
  listName,
  imageLibraryName,
  columns,
  fields,
  services,
  spContext,
  searchPlaceholder = 'Search',
  createButtonText = 'Create New',
  drawerWidth = 536,
  pageSize = 10,
  className = '',
  employeeListName = 'EmployeeDirectory'
}: UniversalDataManagementProps<T>) => {
  const [searchText, setSearchText] = useState('');
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [formData, setFormData] = useState<Partial<T>>({});
  const [fileInfos, setFileInfos] = useState<{ [key: string]: FileInfo }>({});
  const [data, setData] = useState<T[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeSelectOptions, setEmployeeSelectOptions] = useState<{ value: string; label: string; Status: string }[]>([]);
  const [enrichedData, setEnrichedData] = useState<T[]>([]);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const { sp } = useContext(spContext)!;

  // Check if any field is an employee field
  const hasEmployeeFields = useMemo(() => {
    return fields.some(field => field.isEmployeeField);
  }, [fields]);

  const fetchEmployees = async () => {
    if (!hasEmployeeFields || !services.fetchEmployees) return;

    try {
      const employeeItems = await services.fetchEmployees(sp, employeeListName);
      if (employeeItems) {
        setEmployees(employeeItems);

        if (services.mapEmployeesToSelectOptions) {
          const options = services.mapEmployeesToSelectOptions(employeeItems);
          setEmployeeSelectOptions(options);
        }
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      message.error('Failed to fetch employees');
    }
  };

  const fetchData = async () => {
    try {
      const items = await services.fetchData(sp, listName);
      if (items) {
        const mappedItems = services.mapResponseToData(items);
        setData(mappedItems);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to fetch data');
    }
  };

  const enrichDataWithEmployees = useCallback(() => {
    if (!hasEmployeeFields || !employees.length || !data.length) {
      setEnrichedData(data);
      return;
    }

    if (services.enrichDataWithEmployeeInfo) {
      const enriched = services.enrichDataWithEmployeeInfo(data, employees);
      setEnrichedData(enriched);
    } else {
      setEnrichedData(data);
    }
  }, [data, employees, hasEmployeeFields, services]);

  useEffect(() => {
    fetchData();
    fetchEmployees();
  }, []);

  useEffect(() => {
    enrichDataWithEmployees();
  }, [enrichDataWithEmployees]);

  const getAvailableEmployeeOptions = useMemo(() => {
    if (!hasEmployeeFields || !employeeSelectOptions.length) return [];

    const assignedEmployeeIds = data
      .map(item => {
        const employeeField = fields.find(field => field.isEmployeeField);
        return employeeField ? item[employeeField.key] : null;
      })
      .filter(id => id);

    if (listName === "RecogonizedEmployee") {
      // Show all employees, only published
      return employeeSelectOptions
        .filter(option => option.Status === "publish")
        .map(option => ({
          ...option,
          label: `${option.label} - ${option.value}`,
        }));
    } else {
      // Default: filter out already assigned employees (unless current item)
      return employeeSelectOptions
        .filter(option => {
          const isAssigned = assignedEmployeeIds.includes(option.value);
          const isCurrentEmployee =
            editingItem &&
            fields.some(
              field => field.isEmployeeField && editingItem[field.key] === option.value
            );

          return (!isAssigned || isCurrentEmployee) && option.Status === "publish";
        })
        .map(option => ({
          ...option,
          label: `${option.label} - ${option.value}`,
        }));
    }


  }, [employeeSelectOptions, data, editingItem, fields, hasEmployeeFields]);

  // Search functionality
  const getSearchableFields = useMemo(() => {
    return columns.filter(col => col.searchable !== false).map(col => col.key);
  }, [columns]);

  const filteredData = useMemo(() => {
    if (!searchText) return enrichedData;

    return enrichedData.filter(item =>
      getSearchableFields.some(field =>
        String(item[field] || '').toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [enrichedData, searchText, getSearchableFields]);

  // Generate table columns
  const tableColumns: ColumnsType<T> = useMemo(() => {
    const generatedColumns: ColumnsType<T> = columns.map(col => ({
      title: col.title,
      dataIndex: col.key,
      key: col.key,
      width: col.width,
      render: col.render || ((text: any) => (
        <span className={`${col.key}-text-universal-data-management`}>
          {text}
        </span>
      )),
    }));

    generatedColumns.push({
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record: T) => (
        <div className="action-buttons-universal-data-management">
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => confirmDelete(record)}
            className="action-button-universal-data-management delete-btn-universal-data-management"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="action-button-universal-data-management edit-btn-universal-data-management"
          />
        </div>
      ),
    });

    return generatedColumns;
  }, [columns]);

  // Event handlers
  const handleEdit = useCallback((item: T) => {
    setEditingItem(item);
    setFormData({ ...item });

    // Handle file fields
    const newFileInfos: { [key: string]: FileInfo } = {};
    fields.forEach(field => {
      if ((field.type === 'file' || field.type === 'mediaFile' || field.type === 'pdfFile') &&
        item[field.key] && !String(item[field.key]).includes('placeholder')) {
        const fileInfo: FileInfo = {
          name: String(item[field.key]).split('/').pop() || 'file',
          file: null,
          previewUrl: String(item[field.key]),
          size: ''
        };

        // Add type for different file types
        if (field.type === 'mediaFile' && field.fileTypeField) {
          fileInfo.type = item[field.fileTypeField] as 'image' | 'video';
        } else if (field.type === 'pdfFile') {
          fileInfo.type = 'pdf';
        }

        newFileInfos[field.key] = fileInfo;
      }
    });
    setFileInfos(newFileInfos);

    setIsDrawerVisible(true);
  }, [fields]);

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setFormData({});
    setFileInfos({});
    setIsDrawerVisible(true);
  }, []);

  const handleDelete = async (item: T) => {
    const hide = message.loading('Deleting item...', 0);
    try {
      const itemId = item.id;

      await services.deleteData(sp, listName, itemId);

      // Delete associated files
      if (services.deleteFile) {
        for (const field of fields) {
          if ((field.type === 'file' || field.type === 'mediaFile' || field.type === 'pdfFile') &&
            item[field.key] && !String(item[field.key]).includes('placeholder')) {
            await services.deleteFile(sp, String(item[field.key]));
          }
        }
      }

      message.success('Item deleted successfully!');
      fetchData();
    } catch (error: any) {
      console.error('Error deleting item:', error);
      message.error(error?.message || `Failed to delete item`);
    } finally {
      hide();
    }
  };

  const confirmDelete = (item: T) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this item?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        handleDelete(item);
      },
    });
  };

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleFileChange = useCallback(
    async (fieldKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const field = fields.find(f => f.key === fieldKey);

      // Universal validation by accept (if provided)
      if (field?.accept) {
        const allowedTypes = field.accept.split(",").map(type => type.trim());
        if (!allowedTypes.includes(file.type)) {
          message.error(`Please upload a valid file type: ${field.accept}`);
          return;
        }
      }

      // Special validation for media files (image/video)
      if (field?.type === "mediaFile") {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        if (!isImage && !isVideo) {
          message.error("Please upload an image or video file");
          return;
        }

        if (field.validator) {
          const dimensionError = await field.validator(file);
          if (dimensionError) {
            message.error(dimensionError);
            return;
          }
        }
      }

      // Special validation for PDF files
      if (field?.type === "pdfFile") {
        if (file.type !== 'application/pdf') {
          message.error("Please upload a PDF file");
          return;
        }

        // Optional size check (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          message.error("PDF file must be smaller than 10MB");
          return;
        }

        if (field.validator) {
          const validationError = await field.validator(file);
          if (validationError) {
            message.error(validationError);
            return;
          }
        }
      }

      // Special validation for images (with validator)
      if (field?.type === "file" && file.type.startsWith("image/") && field.validator) {
        const dimensionError = await field.validator(file);
        if (dimensionError) {
          message.error(dimensionError);
          return;
        }
      }

      // Construct FileInfo
      const fileSizeKB = (file.size / 1024).toFixed(2);
      const fileUrl = URL.createObjectURL(file);

      const fileInfo: FileInfo = {
        name: file.name,
        size: `${fileSizeKB} KB`,
        previewUrl: fileUrl,
        file,
        type: file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
            ? "video"
            : file.type === "application/pdf"
              ? "pdf"
              : "other",
      };

      // Auto-update related fields for mediaFile
      if (field?.type === "mediaFile") {
        if (field.autoDetectType && field.fileTypeField) {
          setFormData(prev => ({
            ...prev,
            [field.fileTypeField as string]: fileInfo.type,
          }));
        }

        if (field.fileNameField) {
          const fileName = file.name.split(".")[0];
          setFormData(prev => ({
            ...prev,
            [field.fileNameField as string]:
              prev[field.fileNameField as keyof T] || fileName,
          }));
        }
      }

      // Update state
      setFileInfos(prev => ({
        ...prev,
        [fieldKey]: fileInfo,
      }));

      // Store just the fileUrl in formData for preview/UI purposes
      setFormData(prev => ({ ...prev, [fieldKey]: fileUrl }));
    },
    [fields]
  );

  const handleRemoveFile = useCallback((fieldKey: string) => {
    setFileInfos(prev => {
      const newFileInfos = { ...prev };
      delete newFileInfos[fieldKey];
      return newFileInfos;
    });

    setFormData(prev => ({ ...prev, [fieldKey]: undefined }));

    if (fileInputRefs.current[fieldKey]) {
      fileInputRefs.current[fieldKey]!.value = '';
    }
  }, []);

  const validateForm = useCallback(() => {
    const isDraft = formData.status === 'draft';

    if (isDraft) {
      const hasAnyFieldFilled = fields.some(
        field =>
          field.key !== 'status' &&
          field.required &&
          formData[field.key] !== undefined &&
          formData[field.key] !== null &&
          String(formData[field.key]).trim() !== ''
      );

      if (!hasAnyFieldFilled) {
        message.error('At least one field must be filled to save as draft.');
        return false;
      }

      return true;
    }

    // Full validation for publish/unpublish
    for (const field of fields) {
      const value = formData[field.key];

      // Skip validation for PDF fields when editing and file is removed/empty
      if (field.type === 'pdfFile' && editingItem &&
        (!value || value === undefined || value === null || String(value).trim() === '')) {
        continue;
      }

      if (
        field.required &&
        (
          value === undefined ||
          value === null ||
          (typeof value === 'string' && value.trim() === '')
        )
      ) {
        message.error(`${field.label} is required`);
        return false;
      }

      if (field.validator && value !== undefined && value !== null &&
        field.type !== 'file' && field.type !== 'mediaFile' && field.type !== 'pdfFile') {
        const error = field.validator(value);
        if (error) {
          message.error(error);
          return false;
        }
      }
    }

    return true;
  }, [formData, fields, editingItem]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    const hide = message.loading(editingItem ? 'Updating item...' : 'Creating item...', 0);

    try {
      let processedData: any = { ...formData };

      // Clean up removed PDF fields from processedData
      fields.forEach(field => {
        if (field.type === 'pdfFile' && !fileInfos[field.key]) {
          // If PDF field doesn't have fileInfo and it's editing mode, set to null/empty
          if (editingItem) {
            processedData[field.key] = null;
          }
        }
      });

      // Delete old files when updating and new files are uploaded OR when files are removed
      if (editingItem && services.deleteFile) {
        for (const field of fields) {
          if ((field.type === 'file' || field.type === 'mediaFile' || field.type === 'pdfFile') &&
            fileInfos[field.key]) {
            const fileInfo = fileInfos[field.key];
            const oldFileUrl = editingItem[field.key];

            const hasNewFileObject = fileInfo.file instanceof File;
            const hasOldFileToDelete = oldFileUrl && !String(oldFileUrl).includes('placeholder');

            if (hasNewFileObject && hasOldFileToDelete) {
              try {
                await services.deleteFile(sp, String(oldFileUrl));
              } catch (error) {
                console.warn(`Failed to delete old file: ${oldFileUrl}`, error);
              }
            }
          }

          // Handle PDF removal case - delete old PDF if it's removed 
          if (field.type === 'pdfFile' && !fileInfos[field.key] && editingItem[field.key]) {
            const oldPdfUrl = editingItem[field.key];
            if (oldPdfUrl && !String(oldPdfUrl).includes('placeholder')) {
              try {
                await services.deleteFile(sp, String(oldPdfUrl));
                if (services.clearColumnIfNoData) {
                  await services.clearColumnIfNoData(sp, listName, editingItem.id)
                }
                console.log(`Successfully deleted removed PDF: ${oldPdfUrl}`);
              } catch (error) {
                console.warn(`Failed to delete removed PDF: ${oldPdfUrl}`, error);
              }
            }
          }
        }
      }

      // Helper function to generate unique filename with timestamp
      const generateUniqueFilename = (originalFile: File) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
        const fileExtension = originalFile.name.split('.').pop();
        const baseName = originalFile.name.split('.').slice(0, -1).join('.');
        return `${baseName}_${timestamp}.${fileExtension}`;
      };

      // Handle different file types
      const mediaFileField = fields.find(f => f.type === 'mediaFile');
      const pdfFileField = fields.find(f => f.type === 'pdfFile');
      let uploadedFile = null;
      let uploadedPdfFile = null;

      // Handle media file upload
      if (mediaFileField && fileInfos[mediaFileField.key]) {
        uploadedFile = fileInfos[mediaFileField.key].file;

        if (uploadedFile) {
          const uniqueFilename = generateUniqueFilename(uploadedFile);
          const renamedFile = new File([uploadedFile], uniqueFilename, {
            type: uploadedFile.type,
            lastModified: uploadedFile.lastModified,
          });
          uploadedFile = renamedFile;
        }

        if (services.uploadFile && imageLibraryName && !editingItem) {
          const fileInfoWithUniqueName = {
            ...fileInfos[mediaFileField.key],
            name: uploadedFile?.name || fileInfos[mediaFileField.key].name,
            file: uploadedFile
          };

          const uploadedUrl = await services.uploadFile(
            sp,
            imageLibraryName,
            fileInfoWithUniqueName
          );
          if (uploadedUrl) {
            processedData[mediaFileField.key] = uploadedUrl;
          }
        }
      }

      // Handle PDF file upload
      if (pdfFileField && fileInfos[pdfFileField.key]) {
        uploadedPdfFile = fileInfos[pdfFileField.key].file;

        if (uploadedPdfFile) {
          const uniqueFilename = generateUniqueFilename(uploadedPdfFile);
          const renamedFile = new File([uploadedPdfFile], uniqueFilename, {
            type: uploadedPdfFile.type,
            lastModified: uploadedPdfFile.lastModified,
          });
          uploadedPdfFile = renamedFile;
        }
      }

      // Handle regular file uploads
      if (services.uploadFile && imageLibraryName) {
        for (const field of fields) {
          if (field.type === 'file' && fileInfos[field.key]) {
            const originalFile = fileInfos[field.key].file;
            if (originalFile) {
              const uniqueFilename = generateUniqueFilename(originalFile);
              const renamedFile = new File([originalFile], uniqueFilename, {
                type: originalFile.type,
                lastModified: originalFile.lastModified,
              });

              const fileInfoWithUniqueName = {
                ...fileInfos[field.key],
                name: uniqueFilename,
                file: renamedFile
              };

              const uploadedUrl = await services.uploadFile(
                sp,
                imageLibraryName,
                fileInfoWithUniqueName
              );
              if (uploadedUrl) {
                processedData[field.key] = uploadedUrl;
              }
            }
          }
        }
      }

      const requestData = services.mapFormDataToRequest(processedData);

      if (editingItem) {
        await services.updateData(sp, listName, editingItem.id, requestData, uploadedPdfFile);
        message.success('Item updated successfully!');
      } else {
        await services.addData(sp, listName, requestData, uploadedFile, uploadedPdfFile);
        message.success('Item added successfully!');
      }

      fetchData();
      setIsDrawerVisible(false);
      setFormData({});
      setFileInfos({});
    } catch (error) {
      console.error('Error saving item:', error);
      message.error('Failed to save item.');
    } finally {
      hide();
    }
  }, [formData, fileInfos, editingItem, validateForm, services, sp, listName, imageLibraryName, fields, fetchData]);

  const handleCancel = useCallback(() => {
    setIsDrawerVisible(false);
    setFormData({});
    setFileInfos({});
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  }, []);

  const paginationConfig = useMemo(() => ({
    pageSize,
    showSizeChanger: false,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} of ${total} items`,
    itemRender: (current: number, type: string, originalElement: React.ReactNode) => {
      if (type === 'prev') {
        return <div><ArrowLeftOutlined /> Previous</div>;
      }
      if (type === 'next') {
        return <div>Next <ArrowRightOutlined /></div>;
      }
      return originalElement;
    },
  }), [pageSize]);

  const renderField = useCallback((field: FieldConfig, isDisabled: boolean) => {
    const value = formData[field.key];

    switch (field.type) {
      case 'text':
        return (
          <Input
            disabled={isDisabled}
            value={value || ''}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="form-input-universal-data-management"
          />
        );

      case 'textarea':
        return (
          <div className="textarea-container-universal-data-management">
            <Input.TextArea
              disabled={isDisabled}
              value={value || ''}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="form-textarea-universal-data-management"
              rows={field.rows || 4}
            />
          </div>
        );

      case 'select':
        const selectOptions = field.isEmployeeField ? getAvailableEmployeeOptions : field.options;

        return (
          <Select
            disabled={isDisabled}
            value={value}
            onChange={(val) => handleInputChange(field.key, val)}
            placeholder={field.placeholder}
            className="form-select-universal-data-management"
            allowClear
            showSearch
            filterOption={(input, option) => {
              const optionText = (option?.label || option?.children)?.toString() || '';
              return optionText.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            }}
            optionFilterProp="children"
          >
            {selectOptions?.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );

      case 'radio':
        return (
          <Radio.Group
            disabled={isDisabled}
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className="form-radio-group-universal-data-management"
          >
            {field.options?.map(option => (
              <Radio key={option.value} value={option.value}>
                {option.label}
              </Radio>
            ))}
          </Radio.Group>
        );


      case 'date':
        return (
          <DatePicker
            disabled={isDisabled}
            placeholder={field.placeholder}
            className="form-input-universal-data-management date-picker-universal-data-management"
            suffixIcon={<CalendarOutlined />}
            format="DD MMM YYYY"
            value={value ? moment(value, 'DD MMM YYYY') : null}
            onChange={(date, dateString) =>
              handleInputChange(field.key, dateString)
            }
          />
        );

      case 'time':
        return (
          <TimePicker.RangePicker
            disabled={isDisabled}
            placeholder={['Start Time', 'End Time']}
            className="form-input-universal-data-management time-picker-universal-data-management"
            format="h a"
            suffixIcon={<ClockCircleOutlined />}
            value={
              value
                ? [
                  moment(value.split(' - ')[0], 'h a'),
                  moment(value.split(' - ')[1], 'h a'),
                ]
                : null
            }
            onChange={(times, timeStrings) => {
              if (timeStrings?.[0] && timeStrings?.[1]) {
                handleInputChange(field.key, `${timeStrings[0]} - ${timeStrings[1]}`);
              }
            }}
          />
        );


      case 'number':
        return (
          <Input
            type="number"
            min={0}
            value={value}
            onChange={(e) => handleInputChange(field.key, Number(e.target.value))}
            placeholder={field.placeholder}
            className="form-input-universal-data-management"
          />
        );

      case 'pdfFile':
        return renderPdfFileUpload(field);

      case 'file':
        return renderFileUpload(field);

      case 'mediaFile':
        return renderMediaFileUpload(field);

      case 'custom':
        return field.render ? field.render(value, formData as T) : null;

      default:
        return null;
    }
  }, [formData, handleInputChange, getAvailableEmployeeOptions]);

  const renderFileUpload = useCallback((field: FieldConfig) => {
    const fileInfo = fileInfos[field.key];

    if (fileInfo) {
      return (
        <div className="upload-preview-universal-data-management">
          <div className="preview-container-universal-data-management">
            <img src={fileInfo.previewUrl} alt="Preview" className="preview-image-universal-data-management" />
          </div>
          <div className="upload-info-universal-data-management">
            <div className="file-details-universal-data-management">
              <div className="filename-universal-data-management">{fileInfo.name}</div>
              <div className="filesize-universal-data-management">{fileInfo.size}</div>
              <div className="progress-container-universal-data-management">
                <div className="progress-bar-universal-data-management">
                  <div className="progress-fill-universal-data-management" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
            <div className="action-buttons-universal-data-management">
              <Button
                onClick={() => handleRemoveFile(field.key)}
                className="remove-button-universal-data-management"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="upload-placeholder-universal-data-management">
        <input
          type="file"
          accept={field.accept}
          onChange={(e) => handleFileChange(field.key, e)}
          className="file-input-universal-data-management"
          ref={(el) => { fileInputRefs.current[field.key] = el; }}
        />
        <div className="placeholder-content-universal-data-management">
          <UploadOutlined className="placeholder-icon-universal-data-management" />
          <p className="placeholder-text-universal-data-management">
            Drag and drop your {field.accept
              ? field.accept
                .split(",")
                .map((type) => type.split("/")[1]?.toUpperCase())
                .join(", ")
              : "file"} file here or
          </p>
          <Button
            icon={<UploadOutlined />}
            onClick={() => fileInputRefs.current[field.key]?.click()}
            className="upload-button-universal-data-management"
          >
            Browse Files
          </Button>
        </div>
      </div>
    );
  }, [fileInfos, handleFileChange, handleRemoveFile]);

  const renderPdfFileUpload = useCallback((field: FieldConfig) => {
    const fileInfo = fileInfos[field.key];
    const isFieldDisabled = field.editingDisabled && !!editingItem;

    if (fileInfo) {
      return (
        <div className="upload-preview-universal-data-management">
          <div className="pdf-preview-container-universal-data-management">
            <FilePdfOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
            <div className="pdf-info-universal-data-management">
              <div className="filename-universal-data-management">{fileInfo.name}</div>
              <div className="filesize-universal-data-management">{fileInfo.size}</div>
              <div className="filetype-universal-data-management">PDF Document</div>
            </div>
          </div>
          <div className="action-buttons-universal-data-management">
            <Button
              onClick={() => window.open(fileInfo.previewUrl, '_blank')}
              className="preview-button-universal-data-management"
              icon={<FilePdfOutlined />}
            >
              Preview PDF
            </Button>
            {/* Allow removal even during editing */}
            <Button
              onClick={() => handleRemoveFile(field.key)}
              className="remove-button-universal-data-management"
            >
              Remove
            </Button>
          </div>
        </div>
      );
    }

    return !isFieldDisabled ? (
      <div className="upload-placeholder-universal-data-management">
        <input
          type="file"
          accept={field.accept || ".pdf"}
          onChange={(e) => handleFileChange(field.key, e)}
          className="file-input-universal-data-management"
          ref={(el) => { fileInputRefs.current[field.key] = el; }}
        />
        <div className="placeholder-content-universal-data-management">
          <FilePdfOutlined className="placeholder-icon-universal-data-management" />
          <p className="placeholder-text-universal-data-management">
            Drag and drop your PDF file here or
          </p>
          <Button
            icon={<FilePdfOutlined />}
            onClick={() => fileInputRefs.current[field.key]?.click()}
            className="upload-button-universal-data-management"
          >
            Browse PDF Files
          </Button>
          <p className="supported-formats-universal-data-management">
            Supported format: PDF (max 10MB)
          </p>
        </div>
      </div>
    ) : (
      <div className="disabled-field-universal-data-management">
        <span>PDF upload disabled during editing</span>
      </div>
    );
  }, [fileInfos, handleFileChange, handleRemoveFile, editingItem]);

  // Render function for media file upload
  const renderMediaFileUpload = useCallback((field: FieldConfig) => {
    const fileInfo = fileInfos[field.key];

    if (fileInfo) {
      return (
        <div className="upload-preview-universal-data-management">
          {!editingItem ? (
            <div className="preview-container-universal-data-management">
              {fileInfo.type === 'image' ? (
                <img src={fileInfo.previewUrl} alt="Preview" className="preview-image-universal-data-management" />
              ) : (
                <div className="preview-video-container-universal-data-management">
                  <video src={fileInfo.previewUrl} className="preview-video-universal-data-management" controls />
                </div>
              )}
            </div>
          ) : (
            <div className="preview-editing-container-universal-data-management">
              {fileInfo.type === 'image' ? (
                <img src={fileInfo.previewUrl} alt="Preview" className="preview-image-universal-data-management" />
              ) : (
                <div className="preview-video-container-universal-data-management">
                  <video src={fileInfo.previewUrl} className="preview-video-universal-data-management" controls />
                </div>
              )}
            </div>
          )}
          {!editingItem && (
            <div className="upload-info-universal-data-management">
              <div className="file-details-universal-data-management">
                <div className="filename-universal-data-management">{fileInfo.name}</div>
                <div className="filesize-universal-data-management">{fileInfo.size}</div>
                <div className="filetype-universal-data-management">{fileInfo.type?.toUpperCase()}</div>
              </div>
              <div className="action-buttons-universal-data-management">
                <Button
                  onClick={() => handleRemoveFile(field.key)}
                  className="remove-button-universal-data-management"
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return !editingItem ? (
      <div className="upload-placeholder-universal-data-management">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => handleFileChange(field.key, e)}
          className="file-input-universal-data-management"
          ref={(el) => { fileInputRefs.current[field.key] = el; }}
        />
        <div className="placeholder-content-universal-data-management">
          <UploadOutlined className="placeholder-icon-universal-data-management" />
          <p className="placeholder-text-universal-data-management">
            Drag and drop your image or video here or
          </p>
          <Button
            icon={<UploadOutlined />}
            onClick={() => fileInputRefs.current[field.key]?.click()}
            className="upload-button-universal-data-management"
          >
            Browse Files
          </Button>
          <p className="supported-formats-universal-data-management">
            Supported formats: JPG, PNG, GIF, MP4, MOV, AVI, WebM
          </p>
        </div>
      </div>
    ) : null;
  }, [fileInfos, handleFileChange, handleRemoveFile, editingItem]);

  return (
    <div className={`universal-data-container-universal-data-management ${className}`}>
      <div className="universal-data-header-universal-data-management">
        <h1>{title}</h1>

        <div className="header-actions-universal-data-management">
          <Input
            placeholder={searchPlaceholder}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearchChange}
            className="search-input-universal-data-management"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            className="create-button-universal-data-management"
          >
            {createButtonText}
          </Button>
        </div>
      </div>

      <div className="table-container-universal-data-management">
        <Table
          columns={tableColumns}
          dataSource={filteredData}
          rowKey="id"
          pagination={paginationConfig}
          className="custom-table-universal-data-management"
          scroll={{ x: 1000 }}
        />
      </div>

      <Drawer
        title={null}
        placement="right"
        width={drawerWidth}
        height="100vh"
        visible={isDrawerVisible}
        onClose={handleCancel}
        closable={false}
        className="custom-drawer-universal-data-management"
        bodyStyle={{ padding: 0 }}
        headerStyle={{ display: 'none' }}
      >
        <div className="drawer-content-universal-data-management">
          <div className="drawer-header-universal-data-management">
            <h2>{editingItem ? `Edit ${title}` : title}</h2>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={handleCancel}
              className="close-button-universal-data-management"
            />
          </div>

          <div className="drawer-body-universal-data-management">
            <div className="form-section-universal-data-management">
              {fields.map(field => {
                const isDisabled = field.editingDisabled && !!editingItem;

                return (
                  <div key={field.key} className="form-group-universal-data-management">
                    <label className="form-label-universal-data-management">
                      {field.label}
                      {field.required && (
                        <span className="required-asterisk-universal-data-management">*</span>
                      )}
                    </label>
                    {(field.type === 'file' || field.type === 'mediaFile' || field.type === 'pdfFile') ? (
                      <div className="file-upload-section-universal-data-management">
                        {renderField(field, isDisabled || false)}
                      </div>
                    ) : (
                      renderField(field, isDisabled || false)
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="drawer-footer-universal-data-management">
            <Button onClick={handleCancel} className="cancel-btn-universal-data-management">
              Cancel
            </Button>
            <Button onClick={handleSubmit} type="primary" className="confirm-btn-universal-data-management">
              {editingItem ? 'Update' : 'Confirm'}
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default UniversalDataManagement;