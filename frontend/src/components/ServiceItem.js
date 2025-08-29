import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Card, Badge, Button, Form, Input, Space, Typography, Modal } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined, 
  LinkOutlined,
  HolderOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

const ServiceItem = ({ service, index, onUpdate, onDelete, onRefreshHealth }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  const handleEdit = () => {
    setIsEditing(true);
    form.setFieldsValue({
      name: service.name,
      address: service.address,
      port: service.port || ''
    });
  };

  const handleSave = async (values) => {
    await onUpdate(service.id, {
      name: values.name,
      address: values.address,
      port: values.port ? parseInt(values.port) : null
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Are you sure you want to delete this service?',
      content: `This will permanently delete "${service.name}".`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => onDelete(service.id),
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return '🟢';
      case 'unhealthy':
        return '🔴';
      default:
        return '🟡';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'healthy':
        return 'Online';
      case 'unhealthy':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const handleServiceClick = () => {
    const url = `http://${service.address}${service.port ? `:${service.port}` : ''}`;
    window.open(url, '_blank');
  };

  const formatLastChecked = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'unhealthy':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Draggable draggableId={service.id.toString()} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          size="small"
          style={{
            marginBottom: '16px',
            cursor: snapshot.isDragging ? 'grabbing' : 'default',
            transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
            opacity: snapshot.isDragging ? 0.8 : 1,
            transition: 'all 0.2s ease',
          }}
          hoverable={!isEditing}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <div 
              {...provided.dragHandleProps}
              style={{ 
                cursor: 'grab',
                padding: '4px',
                color: '#8c8c8c',
                alignSelf: 'flex-start'
              }}
              title="Drag to reorder"
            >
              <HolderOutlined />
            </div>

            <div style={{ flex: 1 }}>
              {isEditing ? (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSave}
                  size="small"
                >
                  <Form.Item
                    name="name"
                    rules={[{ required: true, message: 'Please enter a service name' }]}
                  >
                    <Input placeholder="Service Name" autoFocus />
                  </Form.Item>
                  <Form.Item
                    name="address"
                    rules={[{ required: true, message: 'Please enter an address' }]}
                  >
                    <Input placeholder="IP Address or hostname" />
                  </Form.Item>
                  <Form.Item name="port">
                    <Input type="number" placeholder="Port (optional)" />
                  </Form.Item>
                  <Form.Item style={{ margin: 0 }}>
                    <Space>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        size="small"
                        icon={<SaveOutlined />}
                      >
                        Save
                      </Button>
                      <Button 
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              ) : (
                <>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <Title 
                      level={4} 
                      style={{ 
                        margin: 0, 
                        cursor: 'pointer',
                        color: '#1890ff'
                      }} 
                      onClick={handleServiceClick}
                    >
                      {service.name}
                    </Title>
                    <Badge 
                      status={getStatusColor(service.status)}
                      text={`${getStatusIcon(service.status)} ${getStatusText(service.status)}`}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <Text 
                      style={{ 
                        color: '#1890ff',
                        cursor: 'pointer'
                      }} 
                      onClick={handleServiceClick}
                      title="Click to open in new tab"
                    >
                      <LinkOutlined /> {service.address}{service.port ? `:${service.port}` : ''}
                    </Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Last checked: {formatLastChecked(service.last_checked)}
                      </Text>
                    </div>
                  </div>

                  <Space size="small">
                    <Button
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={() => onRefreshHealth(service.id)}
                      title="Refresh health status"
                    >
                      Refresh
                    </Button>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={handleEdit}
                      title="Edit service"
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleDelete}
                      title="Delete service"
                    >
                      Delete
                    </Button>
                  </Space>
                </>
              )}
            </div>
          </div>
        </Card>
      )}
    </Draggable>
  );
};

export default ServiceItem;
