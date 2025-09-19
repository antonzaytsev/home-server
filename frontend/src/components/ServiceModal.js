import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { Plus, PencilSquare } from 'react-bootstrap-icons';

const ServiceModal = ({ show, onHide, onSubmit, service = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    health_check_url: ''
  });
  const [validated, setValidated] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [healthUrlError, setHealthUrlError] = useState('');

  const isEditing = service !== null;

  useEffect(() => {
    if (service) {
      // Convert legacy address/port format to URL for editing
      let url = service.url;
      if (!url && service.address) {
        if (service.address.startsWith('http://') || service.address.startsWith('https://')) {
          url = service.address;
        } else {
          url = `http://${service.address}${service.port ? `:${service.port}` : ''}`;
        }
      }
      
      setFormData({
        name: service.name,
        url: url || '',
        health_check_url: service.health_check_url || ''
      });
    } else {
      setFormData({
        name: '',
        url: '',
        health_check_url: ''
      });
    }
    setValidated(false);
    setUrlError('');
    setHealthUrlError('');
  }, [service, show]);

  const validateUrl = (url, required = true) => {
    if (!url) return required ? 'URL is required' : '';
    
    try {
      // Allow URLs without protocol, we'll add http:// automatically
      let testUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        testUrl = `http://${url}`;
      }
      
      const urlObj = new URL(testUrl);
      if (!urlObj.hostname) {
        return 'Invalid URL format';
      }
      return '';
    } catch {
      return 'Invalid URL format';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    // Validate URLs
    const urlValidationError = validateUrl(formData.url, true);
    const healthUrlValidationError = validateUrl(formData.health_check_url, false);
    setUrlError(urlValidationError);
    setHealthUrlError(healthUrlValidationError);

    if (form.checkValidity() === false || urlValidationError || healthUrlValidationError) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Normalize URLs - add protocol if missing
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
        // Clear legacy fields
        address: null,
        port: null
      });

      // Reset form and close modal
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
    
    // Clear URL error when user starts typing
    if (field === 'url' && urlError) {
      setUrlError('');
    }
    if (field === 'health_check_url' && healthUrlError) {
      setHealthUrlError('');
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: '', url: '', health_check_url: '' });
      setValidated(false);
      setUrlError('');
      setHealthUrlError('');
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditing ? (
            <>
              <PencilSquare className="me-2" />
              Edit Service
            </>
          ) : (
            <>
              <Plus className="me-2" />
              Add New Service
            </>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Service Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Home Assistant, Plex Server, Router Admin"
              value={formData.name}
              onChange={handleChange('name')}
              disabled={isSubmitting}
              autoFocus
              required
            />
            <Form.Control.Feedback type="invalid">
              Please enter a service name.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Service URL</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., http://192.168.0.30:8123, https://plex.example.com, 192.168.0.1:9000"
              value={formData.url}
              onChange={handleChange('url')}
              disabled={isSubmitting}
              isInvalid={!!urlError || (validated && !formData.url)}
              required
            />
            <Form.Text className="text-muted">
              Enter the URL to open the service. Protocol (http://) will be added automatically if not specified.
            </Form.Text>
            <Form.Control.Feedback type="invalid">
              {urlError || 'Please enter a valid URL.'}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Health Check URL <span className="text-muted">(Optional)</span></Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., http://192.168.0.30:8123/api/health, same as service URL if empty"
              value={formData.health_check_url}
              onChange={handleChange('health_check_url')}
              disabled={isSubmitting}
              isInvalid={!!healthUrlError}
            />
            <Form.Text className="text-muted">
              Optional separate URL for health checks. If empty, the service URL will be used for health monitoring.
            </Form.Text>
            <Form.Control.Feedback type="invalid">
              {healthUrlError}
            </Form.Control.Feedback>
          </Form.Group>

          <Alert variant="info" className="mb-3">
            <strong>💡 URL Examples:</strong>
          </Alert>
          <div className="bg-light p-3 rounded mb-4">
            <div className="small">
              <div><strong>🏠 Home Assistant:</strong> http://192.168.0.30:8123</div>
              <div><strong>🎬 Plex Server:</strong> http://192.168.0.30:32400/web</div>
              <div><strong>🌐 Router Admin:</strong> http://192.168.0.1</div>
              <div><strong>🔒 Pi-hole:</strong> http://192.168.0.100:8080/admin</div>
              <div><strong>🌍 External Service:</strong> https://home.example.com:9443</div>
            </div>
          </div>

          <div className="d-flex gap-2 justify-content-end">
            <Button
              variant="outline-secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Saving...'
              ) : (
                isEditing ? 'Update Service' : 'Add Service'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ServiceModal;
