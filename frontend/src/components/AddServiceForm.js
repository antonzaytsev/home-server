import React, { useState } from 'react';
import './AddServiceForm.css';

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
    <div className="add-service-form">
      <h3>Add New Service</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">
            Service Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            placeholder="e.g., Home Assistant, Plex Server"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="address">
            IP Address <span className="required">*</span>
          </label>
          <input
            type="text"
            id="address"
            placeholder="e.g., 192.168.0.30"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^localhost$"
            required
            disabled={isSubmitting}
          />
          <small className="field-hint">
            Enter the IP address or hostname of your service
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="port">
            Port (optional)
          </label>
          <input
            type="number"
            id="port"
            placeholder="e.g., 8080, 9000"
            value={formData.port}
            onChange={(e) => handleInputChange('port', e.target.value)}
            min="1"
            max="65535"
            disabled={isSubmitting}
          />
          <small className="field-hint">
            Leave empty for default HTTP port (80)
          </small>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : '+ Add Service'}
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
      
      <div className="form-help">
        <h4>💡 Quick Examples:</h4>
        <ul>
          <li><strong>Home Assistant:</strong> 192.168.0.30:8123</li>
          <li><strong>Plex Media Server:</strong> 192.168.0.30:32400</li>
          <li><strong>Router Admin:</strong> 192.168.0.1 (port 80)</li>
          <li><strong>Pi-hole:</strong> 192.168.0.100:8080</li>
        </ul>
      </div>
    </div>
  );
};

export default AddServiceForm;
