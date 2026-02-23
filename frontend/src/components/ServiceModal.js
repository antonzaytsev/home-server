import React, { useState, useEffect } from 'react';
import { Modal, Form, Input } from 'antd';

const ServiceModal = ({ open, onCancel, onSubmit, service = null }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = service !== null;

  useEffect(() => {
    if (open) {
      if (service) {
        let url = service.url;
        if (!url && service.address) {
          if (service.address.startsWith('http://') || service.address.startsWith('https://')) {
            url = service.address;
          } else {
            url = `http://${service.address}${service.port ? `:${service.port}` : ''}`;
          }
        }
        form.setFieldsValue({
          name: service.name || '',
          url: url || '',
          health_check_url: service.health_check_url || '',
        });
      } else {
        form.resetFields();
      }
    }
  }, [service, open, form]);

  const validateUrl = (_, value) => {
    if (!value) return Promise.resolve();
    try {
      let testUrl = value;
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        testUrl = `http://${value}`;
      }
      const urlObj = new URL(testUrl);
      if (!urlObj.hostname) return Promise.reject('Invalid URL format');
      return Promise.resolve();
    } catch {
      return Promise.reject('Invalid URL format');
    }
  };

  const handleFinish = async (values) => {
    setIsSubmitting(true);
    try {
      let normalizedUrl = values.url;
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = `http://${normalizedUrl}`;
      }
      let normalizedHealthUrl = values.health_check_url;
      if (normalizedHealthUrl && !normalizedHealthUrl.startsWith('http://') && !normalizedHealthUrl.startsWith('https://')) {
        normalizedHealthUrl = `http://${normalizedHealthUrl}`;
      }

      await onSubmit({
        name: values.name,
        url: normalizedUrl,
        health_check_url: normalizedHealthUrl || null,
        address: null,
        port: null,
      });

      form.resetFields();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOk = () => {
    form.submit();
  };

  return (
    <Modal
      title={isEditing ? 'Edit Service' : 'Add New Service'}
      open={open}
      onCancel={() => !isSubmitting && onCancel()}
      onOk={handleOk}
      okText={isSubmitting ? 'Saving...' : isEditing ? 'Update Service' : 'Add Service'}
      confirmLoading={isSubmitting}
      destroyOnClose
      maskClosable={!isSubmitting}
      width={640}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          label="Service Name"
          name="name"
          rules={[{ required: true, message: 'Please enter a service name.' }]}
        >
          <Input
            placeholder="e.g., Home Assistant, Plex Server, Router Admin"
            disabled={isSubmitting}
          />
        </Form.Item>

        <Form.Item
          label="Service URL"
          name="url"
          rules={[
            { required: true, message: 'URL is required.' },
            { validator: validateUrl },
          ]}
          help="Enter the URL to open the service. Protocol (http://) will be added automatically if not specified."
        >
          <Input
            placeholder="e.g., http://192.168.0.30:8123, https://plex.example.com"
            disabled={isSubmitting}
          />
        </Form.Item>

        <Form.Item
          label="Health Check URL (Optional)"
          name="health_check_url"
          rules={[{ validator: validateUrl }]}
          help="Optional separate URL for health checks. If empty, the service URL will be used for health monitoring."
        >
          <Input
            placeholder="e.g., http://192.168.0.30:8123/api/health"
            disabled={isSubmitting}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ServiceModal;
