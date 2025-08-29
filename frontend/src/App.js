import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext } from 'react-beautiful-dnd';
import ServiceList from './components/ServiceList';
import AddServiceForm from './components/AddServiceForm';

import './ui-kit.css';

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
      <div className="container py-3xl">
        <div className="d-flex flex-column align-center justify-center min-h-screen">
          <div className="spinner spinner-xl"></div>
          <p className="text-lg text-secondary mt-md">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <header className="bg-secondary border-b px-lg py-xl">
        <div className="container">
          <div className="d-flex align-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-sm">
                🏠 Home Server Gallery
              </h1>
              <p className="text-lg text-secondary">
                Your network services at a glance
              </p>
            </div>
            <span className="badge badge-primary px-md py-sm">
              {services.length} Service{services.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </header>

      {error && (
        <div className="container pt-md">
          <div className="alert alert-danger">
            <div className="alert-content">
              <div className="alert-title">Error</div>
              {error}
            </div>
            <button 
              onClick={() => setError(null)} 
              className="alert-close"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <main className="container py-xl">
        <div className="d-flex gap-md mb-xl">
          <button 
            className={`btn ${showAddForm ? "btn-outline-primary" : "btn-primary"} btn-lg`}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '× Cancel' : '+ Add Service'}
          </button>
          
          <button 
            className="btn btn-outline-secondary btn-lg"
            onClick={fetchServices}
          >
            🔄 Refresh
          </button>
        </div>

        {showAddForm && (
          <div className="mb-xl">
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
          <div className="empty-state text-center py-3xl">
            <div className="empty-state-icon mb-lg">
              🖥️
            </div>
            <h3 className="empty-state-title">No services yet</h3>
            <p className="empty-state-text mb-lg">
              Get started by adding your first home server service
            </p>
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => setShowAddForm(true)}
            >
              + Add Your First Service
            </button>
          </div>
        )}
      </main>


    </div>
  );
}

export default App;
