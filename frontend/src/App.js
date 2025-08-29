import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext } from 'react-beautiful-dnd';
import { Layout, Button, Spin, Alert, Typography, Badge, Space } from 'antd';
import { PlusOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import ServiceList from './components/ServiceList';
import AddServiceForm from './components/AddServiceForm';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const API_BASE_URL = 'http://localhost:4567/api';

function App() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/services`);
      setServices(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch services');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async (serviceData) => {
    try {
      await axios.post(`${API_BASE_URL}/services`, serviceData);
      setShowAddForm(false);
      fetchServices(); // Refresh the list
    } catch (err) {
      setError('Failed to add service');
      console.error('Error adding service:', err);
    }
  };

  const handleUpdateService = async (id, serviceData) => {
    try {
      await axios.put(`${API_BASE_URL}/services/${id}`, serviceData);
      fetchServices(); // Refresh the list
    } catch (err) {
      setError('Failed to update service');
      console.error('Error updating service:', err);
    }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await axios.delete(`${API_BASE_URL}/services/${id}`);
        fetchServices(); // Refresh the list
      } catch (err) {
        setError('Failed to delete service');
        console.error('Error deleting service:', err);
      }
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(services);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display_order for all items
    const updatedServices = items.map((service, index) => ({
      id: service.id,
      display_order: index + 1
    }));

    // Optimistically update the UI
    setServices(items);

    try {
      await axios.put(`${API_BASE_URL}/services/reorder`, {
        services: updatedServices
      });
    } catch (err) {
      setError('Failed to reorder services');
      console.error('Error reordering services:', err);
      // Revert on error
      fetchServices();
    }
  };

  const handleRefreshHealth = async (id) => {
    try {
      await axios.get(`${API_BASE_URL}/services/${id}/health`);
      fetchServices(); // Refresh to get updated health status
    } catch (err) {
      console.error('Error refreshing health:', err);
    }
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Space direction="vertical" align="center">
            <Spin size="large" />
            <Text>Loading services...</Text>
          </Space>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        backgroundColor: '#fff', 
        borderBottom: '1px solid #f0f0f0', 
        padding: '0 24px',
        height: 'auto',
        paddingTop: '24px',
        paddingBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={1} style={{ margin: 0, marginBottom: '8px' }}>
              <HomeOutlined /> Home Server Gallery
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Your network services at a glance
            </Text>
          </div>
          <Badge 
            count={`${services.length} Service${services.length !== 1 ? 's' : ''}`} 
            style={{ backgroundColor: '#1890ff' }}
          />
        </div>
      </Header>

      <Content style={{ padding: '24px' }}>
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: '24px' }}
          />
        )}

        <Space size="middle" style={{ marginBottom: '24px' }}>
          <Button 
            type={showAddForm ? "default" : "primary"}
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Add Service'}
          </Button>
          
          <Button 
            size="large"
            icon={<ReloadOutlined />}
            onClick={fetchServices}
          >
            Refresh
          </Button>
        </Space>

        {showAddForm && (
          <div style={{ marginBottom: '24px' }}>
            <AddServiceForm 
              onSubmit={handleAddService}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <ServiceList
            services={services}
            onUpdate={handleUpdateService}
            onDelete={handleDeleteService}
            onRefreshHealth={handleRefreshHealth}
          />
        </DragDropContext>

        {services.length === 0 && !showAddForm && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>
              🖥️
            </div>
            <Title level={3}>No services yet</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
              Get started by adding your first home server service
            </Text>
            <Button 
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setShowAddForm(true)}
            >
              Add Your First Service
            </Button>
          </div>
        )}
      </Content>
    </Layout>
  );
}

export default App;
