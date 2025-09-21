import React, { useState, useEffect } from 'react';

const ServiceModal = ({ show, onHide, onSubmit, service = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', url: '', health_check_url: '' });
  const [validated, setValidated] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [healthUrlError, setHealthUrlError] = useState('');

  const isEditing = service !== null;

  useEffect(() => {
    if (service) {
      let url = service.url;
      if (!url && service.address) {
        if (service.address.startsWith('http://') || service.address.startsWith('https://')) {
          url = service.address;
        } else {
          url = `http://${service.address}${service.port ? `:${service.port}` : ''}`;
        }
      }

      setFormData({
        name: service.name || '',
        url: url || '',
        health_check_url: service.health_check_url || ''
      });
    } else {
      setFormData({ name: '', url: '', health_check_url: '' });
    }
    setValidated(false);
    setUrlError('');
    setHealthUrlError('');
  }, [service, show]);

  const validateUrl = (url, required = true) => {
    if (!url) return required ? 'URL is required' : '';
    try {
      let testUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        testUrl = `http://${url}`;
      }
      const urlObj = new URL(testUrl);
      if (!urlObj.hostname) return 'Invalid URL format';
      return '';
    } catch {
      return 'Invalid URL format';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const urlValidationError = validateUrl(formData.url, true);
    const healthUrlValidationError = validateUrl(formData.health_check_url, false);
    setUrlError(urlValidationError);
    setHealthUrlError(healthUrlValidationError);

    if (urlValidationError || healthUrlValidationError || !formData.name) {
      setValidated(true);
      return;
    }

    setIsSubmitting(true);
    try {
      let normalizedUrl = formData.url;
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = `http://${normalizedUrl}`;
      }
      let normalizedHealthUrl = formData.health_check_url;
      if (normalizedHealthUrl && !normalizedHealthUrl.startsWith('http://') && !normalizedHealthUrl.startsWith('https://')) {
        normalizedHealthUrl = `http://${normalizedHealthUrl}`;
      }

      await onSubmit({
        name: formData.name,
        url: normalizedUrl,
        health_check_url: normalizedHealthUrl || null,
        address: null,
        port: null,
      });

      setFormData({ name: '', url: '', health_check_url: '' });
      setValidated(false);
      setUrlError('');
      setHealthUrlError('');
      onHide();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData({ ...formData, [field]: value });
    if (field === 'url' && urlError) setUrlError('');
    if (field === 'health_check_url' && healthUrlError) setHealthUrlError('');
  };

  if (!show) return null;

  return (
    <div className="modalOverlay" onClick={() => !isSubmitting && onHide()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div className="modalTitle">{isEditing ? 'Edit Service' : 'Add New Service'}</div>
          <button className="iconButton" onClick={() => !isSubmitting && onHide()}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="formRow">
            <label>Service Name</label>
            <input
              className="input"
              value={formData.name}
              onChange={handleChange('name')}
              disabled={isSubmitting}
              required
              placeholder="e.g., Home Assistant, Plex Server, Router Admin"
            />
            {validated && !formData.name && (
              <div className="errorText">Please enter a service name.</div>
            )}
          </div>

          <div className="formRow">
            <label>Service URL</label>
            <input
              className="input"
              value={formData.url}
              onChange={handleChange('url')}
              disabled={isSubmitting}
              required
              placeholder="e.g., http://192.168.0.30:8123, https://plex.example.com"
            />
            <div className="helper">
              {urlError || 'Enter the URL to open the service. Protocol (http://) will be added automatically if not specified.'}
            </div>
          </div>

          <div className="formRow">
            <label>Health Check URL (Optional)</label>
            <input
              className="input"
              value={formData.health_check_url}
              onChange={handleChange('health_check_url')}
              disabled={isSubmitting}
              placeholder="e.g., http://192.168.0.30:8123/api/health"
            />
            <div className="helper">{healthUrlError || 'Optional separate URL for health checks. If empty, the service URL will be used for health monitoring.'}</div>
          </div>

          <div className="modalActions">
            <button type="button" className="button" onClick={() => !isSubmitting && onHide()}>Cancel</button>
            <button type="submit" className="button primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Service' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal;
