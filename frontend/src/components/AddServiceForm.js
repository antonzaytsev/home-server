import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';

const AddServiceForm = ({ onSubmit, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    port: ''
  });
  const [validated, setValidated] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
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
      setFormData({ name: '', address: '', port: '' });
      setValidated(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title className="mb-0">
          ✨ Add New Service
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Service Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Home Assistant, Plex Server"
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
            <Form.Label>IP Address or Hostname</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., 192.168.0.30 or localhost"
              value={formData.address}
              onChange={handleChange('address')}
              disabled={isSubmitting}
              required
            />
            <Form.Text className="text-muted">
              Enter the IP address or hostname of your service
            </Form.Text>
            <Form.Control.Feedback type="invalid">
              Please enter an IP address or hostname.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Port (optional)</Form.Label>
            <Form.Control
              type="number"
              placeholder="e.g., 8080, 9000"
              value={formData.port}
              onChange={handleChange('port')}
              disabled={isSubmitting}
              min={1}
              max={65535}
            />
            <Form.Text className="text-muted">
              Leave empty for default HTTP port (80)
            </Form.Text>
          </Form.Group>

          <div className="d-flex gap-2 mb-4">
            <Button 
              variant="primary"
              type="submit"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Loading...</>
              ) : (
                <><Plus className="me-2" />Add Service</>
              )}
            </Button>
            <Button 
              variant="outline-secondary"
              size="lg"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </Form>

        <Alert variant="info" className="mb-3">
          <strong>💡 Quick Examples:</strong>
        </Alert>
        <div className="bg-light p-3 rounded">
          <div className="small">
            <div><strong>🏠 Home Assistant:</strong> 192.168.0.30:8123</div>
            <div><strong>🎬 Plex Media Server:</strong> 192.168.0.30:32400</div>
            <div><strong>🌐 Router Admin:</strong> 192.168.0.1 (port 80)</div>
            <div><strong>🔒 Pi-hole:</strong> 192.168.0.100:8080</div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AddServiceForm;
