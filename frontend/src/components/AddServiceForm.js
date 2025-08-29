import React, { useState } from 'react';

// Using CSS classes from the UI toolkit

const AddServiceForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    port: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address) {
      alert('Please fill in the required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        name: formData.name,
        address: formData.address,
        port: formData.port ? parseInt(formData.port) : null
      });
      
      // Reset form
      setFormData({
        name: '',
        address: '',
        port: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card shadow-lg">
      <div className="card-body">
        <h3 className="card-title mb-lg">✨ Add New Service</h3>
        
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-md">
          <div>
            <label htmlFor="name" className="label label-required mb-xs">
              Service Name
            </label>
            <input
              className="input"
              id="name"
              placeholder="e.g., Home Assistant, Plex Server"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          
          <div>
            <label htmlFor="address" className="label label-required mb-xs">
              IP Address or Hostname
            </label>
            <input
              className="input"
              id="address"
              placeholder="e.g., 192.168.0.30 or localhost"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              required
              disabled={isSubmitting}
            />
            <small className="form-text text-tertiary">
              Enter the IP address or hostname of your service
            </small>
          </div>
          
          <div>
            <label htmlFor="port" className="label mb-xs">
              Port (optional)
            </label>
            <input
              className="input"
              type="number"
              id="port"
              placeholder="e.g., 8080, 9000"
              value={formData.port}
              onChange={(e) => handleInputChange('port', e.target.value)}
              min="1"
              max="65535"
              disabled={isSubmitting}
            />
            <small className="form-text text-tertiary">
              Leave empty for default HTTP port (80)
            </small>
          </div>
          
          <div className="d-flex gap-sm pt-md">
            <button 
              type="submit" 
              className={`btn btn-primary btn-lg ${isSubmitting ? 'btn-loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : '+ Add Service'}
            </button>
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-lg"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
        
        <div className="mt-xl">
          <div className="alert alert-info mb-md">
            <div className="alert-content">
              <strong>💡 Quick Examples:</strong>
            </div>
          </div>
          <div className="bg-secondary p-md rounded text-sm">
            <div className="d-flex flex-column gap-xs">
              <div><strong>🏠 Home Assistant:</strong> 192.168.0.30:8123</div>
              <div><strong>🎬 Plex Media Server:</strong> 192.168.0.30:32400</div>
              <div><strong>🌐 Router Admin:</strong> 192.168.0.1 (port 80)</div>
              <div><strong>🔒 Pi-hole:</strong> 192.168.0.100:8080</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddServiceForm;
