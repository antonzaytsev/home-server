import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext } from 'react-beautiful-dnd';
import { Container, Row, Col, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { Plus, ArrowRepeat, House } from 'react-bootstrap-icons';
import ServiceList from './components/ServiceList';
import AddServiceForm from './components/AddServiceForm';

const API_BASE_URL = process.env.API_URL || 'http://192.168.0.30:4568/api';

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
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <Spinner animation="border" size="lg" className="mb-3" />
          <p className="text-muted">Loading services...</p>
        </div>
      </Container>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header className="bg-white border-bottom py-4">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0">
              <House className="me-2" /> Сервисы
            </h1>
            <div className="d-flex gap-2">
              <Button
                variant={showAddForm ? "outline-primary" : "primary"}
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <Plus className="me-2" />
                {showAddForm ? 'Cancel' : 'Add Service'}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={fetchServices}
              >
                <ArrowRepeat className="me-2" />
                Refresh
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <main className="p-4">
        <Container>
          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setError(null)}
              className="mb-4"
            >
              <Alert.Heading>Error</Alert.Heading>
              {error}
            </Alert>
          )}

          {showAddForm && (
            <div className="mb-4">
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
            <div className="text-center py-5">
              <div style={{ fontSize: '48px' }} className="mb-4">
                🖥️
              </div>
              <h3>No services yet</h3>
              <p className="text-muted mb-4">
                Get started by adding your first home server service
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="me-2" />
                Add Your First Service
              </Button>
            </div>
          )}
        </Container>
      </main>
    </div>
  );
}

export default App;
