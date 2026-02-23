import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Layout, Button, Badge, Alert, Spin, Empty, Typography, Space, ConfigProvider } from 'antd';
import { PlusOutlined, ReloadOutlined, DesktopOutlined } from '@ant-design/icons';
import ServiceList from './components/ServiceList';
import ServiceModal from './components/ServiceModal';
import './styles.css';

const { Header, Content } = Layout;
const { Title } = Typography;

const API_HOST = process.env.REACT_APP_API_HOST || window.location.hostname;
const API_PORT = process.env.REACT_APP_API_PORT || '4568';
const API_BASE_URL = `http://${API_HOST}:${API_PORT}/api`;

function App() {
  const [services, setServices] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const reorderRequestId = useRef(0);

  const haveSameServiceOrder = (a, b) => {
    if (!a || !b || a.length !== b.length) return false;
    return a.every((service, index) => service.id === b[index].id);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/services`);
      setServices(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch services');
      console.error('Error fetching services:', err);
    } finally {
      setInitialLoad(false);
    }
  };

  const handleServiceSubmit = async (serviceData) => {
    try {
      if (editingService) {
        await axios.put(`${API_BASE_URL}/services/${editingService.id}`, serviceData);
      } else {
        await axios.post(`${API_BASE_URL}/services`, serviceData);
      }
      setShowServiceModal(false);
      setEditingService(null);
      fetchServices();
    } catch (err) {
      setError(editingService ? 'Failed to update service' : 'Failed to add service');
      console.error('Error with service:', err);
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setShowServiceModal(true);
  };

  const handleAddService = () => {
    setEditingService(null);
    setShowServiceModal(true);
  };

  const handleDeleteService = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/services/${id}`);
      fetchServices();
    } catch (err) {
      setError('Failed to delete service');
      console.error('Error deleting service:', err);
    }
  };

  const handleReorder = async ({ previousServices, nextServices }) => {
    if (
      !Array.isArray(previousServices) ||
      !Array.isArray(nextServices) ||
      haveSameServiceOrder(previousServices, nextServices)
    ) {
      return;
    }

    setServices(nextServices);
    const requestId = ++reorderRequestId.current;

    try {
      const serviceOrders = nextServices.map((service, index) => ({
        id: service.id,
        display_order: index,
      }));
      await axios.put(`${API_BASE_URL}/services/reorder`, { services: serviceOrders });
      setError(null);
    } catch (err) {
      if (requestId !== reorderRequestId.current) return;

      setError('Failed to save order');
      console.error('Error reordering services:', err);

      setServices((currentServices) =>
        haveSameServiceOrder(currentServices, nextServices) ? previousServices : currentServices
      );
    }
  };

  const handleRefreshHealth = async (id) => {
    try {
      await axios.get(`${API_BASE_URL}/services/${id}/health`);
      fetchServices();
    } catch (err) {
      console.error('Error refreshing health:', err);
    }
  };

  if (initialLoad) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" tip="Loading services..." />
      </div>
    );
  }

  return (
    <ConfigProvider>
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
            height: 'auto',
            lineHeight: 'normal',
            paddingTop: 16,
            paddingBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 1200, width: '100%', margin: '0 auto' }}>
            <DesktopOutlined style={{ fontSize: 24, color: '#1677ff' }} />
            <Title level={3} style={{ margin: 0, marginRight: 'auto' }}>
              Сервисы <Badge count={services.length} />
            </Title>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddService}>
                Add Service
              </Button>
              <Button icon={<ReloadOutlined />} onClick={fetchServices}>
                Refresh
              </Button>
            </Space>
          </div>
        </Header>

        <Content style={{ maxWidth: 1200, width: '100%', margin: '0 auto', padding: '32px 24px' }}>
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              style={{ marginBottom: 16 }}
            />
          )}

          <ServiceList
            services={services}
            onEdit={handleEditService}
            onDelete={handleDeleteService}
            onRefreshHealth={handleRefreshHealth}
            onReorder={handleReorder}
          />

          {services.length === 0 && (
            <Empty
              image={<DesktopOutlined style={{ fontSize: 96, color: '#1677ff', opacity: 0.5 }} />}
              description={
                <Space direction="vertical" size={4}>
                  <Typography.Title level={4} style={{ margin: 0 }}>No services yet</Typography.Title>
                  <Typography.Text type="secondary">
                    Transform your home server into a beautiful dashboard by adding your first service
                  </Typography.Text>
                </Space>
              }
              style={{
                padding: '64px 24px',
                marginTop: 24,
                borderRadius: 12,
                background: '#fff',
                border: '1px solid #f0f0f0',
              }}
            >
              <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleAddService}>
                Add Your First Service
              </Button>
            </Empty>
          )}

          <ServiceModal
            open={showServiceModal}
            onCancel={() => {
              setShowServiceModal(false);
              setEditingService(null);
            }}
            onSubmit={handleServiceSubmit}
            service={editingService}
          />
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
