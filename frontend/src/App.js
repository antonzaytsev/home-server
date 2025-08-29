import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext } from 'react-beautiful-dnd';
import ServiceList from './components/ServiceList';
import AddServiceForm from './components/AddServiceForm';
import './App.css';

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
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏠 Home Server Gallery</h1>
        <p className="subtitle">Your network services at a glance</p>
      </header>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="close-error">×</button>
        </div>
      )}

      <main className="main-content">
        <div className="actions">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? '× Cancel' : '+ Add Service'}
          </button>
          <button 
            onClick={fetchServices}
            className="btn btn-secondary"
          >
            🔄 Refresh
          </button>
        </div>

        {showAddForm && (
          <AddServiceForm 
            onSubmit={handleAddService}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <ServiceList
            services={services}
            onUpdate={handleUpdateService}
            onDelete={handleDeleteService}
            onRefreshHealth={handleRefreshHealth}
          />
        </DragDropContext>

        {services.length === 0 && (
          <div className="empty-state">
            <h3>No services yet</h3>
            <p>Click "Add Service" to get started</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Home Server Gallery v1.0.0</p>
      </footer>
    </div>
  );
}

export default App;
