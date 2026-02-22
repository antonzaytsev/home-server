import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ServiceList from './components/ServiceList';
import ServiceModal from './components/ServiceModal';
import './styles.css';

// API configuration with fallback to current window location
const API_HOST = process.env.REACT_APP_API_HOST || window.location.hostname;
const API_PORT = process.env.REACT_APP_API_PORT || '4568';
const API_BASE_URL = `http://${API_HOST}:${API_PORT}/api`;

console.log('API Configuration:', { API_HOST, API_PORT, API_BASE_URL });
console.log('process.env', process.env);

// Icons (simple emoji-based to avoid dependencies)
const Icon = ({ children }) => <span style={{ display: 'inline-flex', alignItems: 'center' }}>{children}</span>;

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
    try {
      await axios.delete(`${API_BASE_URL}/services/${id}`);
      fetchServices(); // Refresh the list
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

    setServices(nextServices); // optimistic update
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
      fetchServices(); // Refresh to get updated health status
    } catch (err) {
      console.error('Error refreshing health:', err);
    }
  };

  if (initialLoad) {
    return (
      <div className="container" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading services...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header className="appBar">
        <div className="toolbar">
          <Icon>📊</Icon>
          <div className="title">Сервисы <span className="countChip">{services.length}</span></div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="button primary" onClick={handleAddService}>＋ Add Service</button>
            <button className="button outlined" onClick={fetchServices}>⟲ Refresh</button>
          </div>
        </div>
      </header>

      <main className="container">
        {error && (
          <div className="errorBanner" role="alert">{error}</div>
        )}

        <ServiceList
          services={services}
          onEdit={handleEditService}
          onDelete={handleDeleteService}
          onRefreshHealth={handleRefreshHealth}
          onReorder={handleReorder}
        />

        {services.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 24px', marginTop: 24, borderRadius: 12, background: 'var(--bg-paper)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 96, marginBottom: 16, opacity: .8 }}>🖥️</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>No services yet</div>
            <div style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 24px' }}>Transform your home server into a beautiful dashboard by adding your first service</div>
            <button className="button primary" onClick={handleAddService}>＋ Add Your First Service</button>
          </div>
        )}

        <ServiceModal
          show={showServiceModal}
          onHide={() => {
            setShowServiceModal(false);
            setEditingService(null);
          }}
          onSubmit={handleServiceSubmit}
          service={editingService}
        />
      </main>
    </div>
  );
}

export default App;
