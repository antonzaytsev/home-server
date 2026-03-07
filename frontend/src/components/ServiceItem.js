import React, { useState } from 'react';
import { Card, Tag, Avatar, Button, Modal, Typography, Tooltip } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import { getServiceIcon, getServiceUrl, getDisplayUrl } from '../utils/serviceUtils';

const { Text } = Typography;

const ServiceItem = ({ service, onEdit, onDelete, onRefreshHealth, onDragHandleMouseDown }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEdit = () => onEdit(service);

  const handleDelete = () => setShowDeleteModal(true);

  const confirmDelete = () => {
    onDelete(service.id);
    setShowDeleteModal(false);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'healthy':
        return { color: 'success', icon: <CheckCircleOutlined />, text: 'Online' };
      case 'unhealthy':
        return { color: 'error', icon: <CloseCircleOutlined />, text: 'Offline' };
      default:
        return { color: 'warning', icon: <ExclamationCircleOutlined />, text: 'Unknown' };
    }
  };

  const handleServiceClick = () => {
    const url = getServiceUrl(service);
    if (url) window.open(url, '_blank');
  };

  const statusConfig = getStatusConfig(service.status);

  return (
    <>
      <Card
        style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
        styles={{ body: { padding: '20px 24px 12px', flex: 1 } }}
        actions={[
          <Tag
            key="status"
            icon={statusConfig.icon}
            color={statusConfig.color}
            style={{ margin: 0, cursor: 'default' }}
          >
            {statusConfig.text}
          </Tag>,
          <Tooltip title="Refresh health" key="refresh">
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => onRefreshHealth(service.id)}
            />
          </Tooltip>,
          <Tooltip title="Edit" key="edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color: '#1677ff' }} />}
              onClick={handleEdit}
            />
          </Tooltip>,
          <Tooltip title="Delete" key="delete">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            />
          </Tooltip>,
        ]}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <Avatar
            size={44}
            style={{ backgroundColor: '#1677ff', marginRight: 16, fontSize: 20, flexShrink: 0 }}
          >
            {getServiceIcon(service.name)}
          </Avatar>
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <Text
              strong
              style={{ fontSize: 18, color: '#1677ff', cursor: 'pointer', display: 'block' }}
              ellipsis
              onClick={handleServiceClick}
            >
              {service.name}
            </Text>
          </div>
          <Tooltip title="Drag to reorder">
            <span
              className="dragHandle"
              onPointerDown={onDragHandleMouseDown}
            >
              <HolderOutlined style={{ fontSize: 20, color: '#bfbfbf' }} />
            </span>
          </Tooltip>
        </div>

        <div
          onClick={handleServiceClick}
          style={{ display: 'flex', alignItems: 'center', marginTop: 'auto', cursor: 'pointer', color: '#1677ff' }}
        >
          <LinkOutlined style={{ marginRight: 8 }} />
          <Text
            style={{ color: '#1677ff', fontWeight: 500 }}
            ellipsis
          >
            {getDisplayUrl(service)}
          </Text>
        </div>
      </Card>

      <Modal
        title="Delete Service"
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onOk={confirmDelete}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete this service?</p>
        <p><strong>This will permanently delete "{service.name}".</strong></p>
      </Modal>
    </>
  );
};

export default ServiceItem;
