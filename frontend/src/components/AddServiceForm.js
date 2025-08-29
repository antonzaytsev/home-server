import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const AddServiceForm = ({ onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        name: values.name,
        address: values.address,
        port: values.port ? parseInt(values.port) : null
      });
      
      // Reset form
      form.resetFields();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card 
      title={
        <Title level={3} style={{ margin: 0 }}>
          ✨ Add New Service
        </Title>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="Service Name"
          name="name"
          rules={[{ required: true, message: 'Please enter a service name' }]}
        >
          <Input 
            placeholder="e.g., Home Assistant, Plex Server"
            disabled={isSubmitting}
            autoFocus
          />
        </Form.Item>
        
        <Form.Item
          label="IP Address or Hostname"
          name="address"
          rules={[{ required: true, message: 'Please enter an IP address or hostname' }]}
          help="Enter the IP address or hostname of your service"
        >
          <Input 
            placeholder="e.g., 192.168.0.30 or localhost"
            disabled={isSubmitting}
          />
        </Form.Item>
        
        <Form.Item
          label="Port (optional)"
          name="port"
          help="Leave empty for default HTTP port (80)"
        >
          <Input 
            type="number"
            placeholder="e.g., 8080, 9000"
            min={1}
            max={65535}
            disabled={isSubmitting}
          />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button 
              type="primary"
              htmlType="submit" 
              size="large"
              icon={<PlusOutlined />}
              loading={isSubmitting}
            >
              Add Service
            </Button>
            <Button 
              size="large"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
      
      <Alert
        message="💡 Quick Examples:"
        type="info"
        style={{ marginBottom: '16px' }}
      />
      <div style={{ backgroundColor: '#fafafa', padding: '16px', borderRadius: '8px' }}>
        <Space direction="vertical" size="small">
          <Text><strong>🏠 Home Assistant:</strong> 192.168.0.30:8123</Text>
          <Text><strong>🎬 Plex Media Server:</strong> 192.168.0.30:32400</Text>
          <Text><strong>🌐 Router Admin:</strong> 192.168.0.1 (port 80)</Text>
          <Text><strong>🔒 Pi-hole:</strong> 192.168.0.100:8080</Text>
        </Space>
      </div>
    </Card>
  );
};

export default AddServiceForm;
