import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext } from 'react-beautiful-dnd';
import { Container, Row, Col, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { Plus, ArrowRepeat, House } from 'react-bootstrap-icons';
import ServiceList from './components/ServiceList';
import ServiceModal from './components/ServiceModal';

// API configuration with fallback to current window location
const API_HOST = process.env.REACT_APP_API_HOST || window.location.hostname;
const API_PORT = process.env.REACT_APP_API_PORT || '4568';
const API_BASE_URL = `http://${API_HOST}:${API_PORT}/api`;

console.log('API Configuration:', { API_HOST, API_PORT, API_BASE_URL });
console.log('process.env', process.env);

function App() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

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

  const handleServiceSubmit = async (serviceData) => {
    try {
      if (editingService) {
        // Update existing service
        await axios.put(`${API_BASE_URL}/services/${editingService.id}`, serviceData);
      } else {
        // Create new service
        await axios.post(`${API_BASE_URL}/services`, serviceData);
      }
      setShowServiceModal(false);
      setEditingService(null);
      fetchServices(); // Refresh the list
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
                variant="primary"
                onClick={handleAddService}
              >
                <Plus className="me-2" />
                Add Service
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

          <DragDropContext onDragEnd={handleDragEnd}>
            <ServiceList
              services={services}
              onEdit={handleEditService}
              onDelete={handleDeleteService}
              onRefreshHealth={handleRefreshHealth}
            />
          </DragDropContext>

          {services.length === 0 && (
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
                onClick={handleAddService}
              >
                <Plus className="me-2" />
                Add Your First Service
              </Button>
            </div>
          )}
        </Container>
      </main>

      <ServiceModal
        show={showServiceModal}
        onHide={() => {
          setShowServiceModal(false);
          setEditingService(null);
        }}
        onSubmit={handleServiceSubmit}
        service={editingService}
      />
    </div>
  );
}

export default App;
