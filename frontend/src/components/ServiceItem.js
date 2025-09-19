import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Card, Badge, Button, Modal } from 'react-bootstrap';
import { 
  PencilSquare, 
  Trash, 
  ArrowRepeat, 
  Link45deg,
  GripVertical
} from 'react-bootstrap-icons';

const ServiceItem = ({ service, index, onEdit, onDelete, onRefreshHealth }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEdit = () => {
    onEdit(service);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDelete(service.id);
    setShowDeleteModal(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return '🟢';
      case 'unhealthy':
        return '🔴';
      default:
        return '🟡';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'healthy':
        return 'Online';
      case 'unhealthy':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const handleServiceClick = () => {
    // Handle both new URL format and legacy address/port format
    let url;
    if (service.url) {
      url = service.url;
    } else if (service.address) {
      if (service.address.startsWith('http://') || service.address.startsWith('https://')) {
        url = service.address;
      } else {
        url = `http://${service.address}${service.port ? `:${service.port}` : ''}`;
      }
    } else {
      return; // No valid URL
    }
    
    window.open(url, '_blank');
  };

  const getDisplayUrl = () => {
    // Handle both new URL format and legacy address/port format
    if (service.url) {
      return service.url.replace(/^https?:\/\//, ''); // Remove protocol for display
    } else if (service.address) {
      if (service.address.startsWith('http://') || service.address.startsWith('https://')) {
        return service.address.replace(/^https?:\/\//, '');
      } else {
        return `${service.address}${service.port ? `:${service.port}` : ''}`;
      }
    }
    return 'No URL';
  };

  const formatLastChecked = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'unhealthy':
        return 'danger';
      default:
        return 'warning';
    }
  };

  return (
    <>
      <Draggable draggableId={service.id.toString()} index={index}>
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="h-100 shadow-sm"
            style={{
              cursor: snapshot.isDragging ? 'grabbing' : 'default',
              transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
              opacity: snapshot.isDragging ? 0.8 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            <Card.Body className="d-flex gap-2 p-3">
              <div 
                {...provided.dragHandleProps}
                className="text-muted align-self-start"
                style={{ cursor: 'grab', padding: '2px' }}
                title="Drag to reorder"
              >
                <GripVertical size={14} />
              </div>

              <div className="flex-fill">
                <>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 
                        className="mb-0 text-primary fw-bold" 
                        style={{ cursor: 'pointer' }}
                        onClick={handleServiceClick}
                        title="Click to open in new tab"
                      >
                        {service.name}
                      </h6>
                      <Badge bg={getStatusColor(service.status)} className="ms-2">
                        {getStatusIcon(service.status)}
                      </Badge>
                    </div>

                    <div className="mb-2">
                      <div 
                        className="text-primary small d-flex align-items-center" 
                        style={{ cursor: 'pointer' }}
                        onClick={handleServiceClick}
                        title="Click to open in new tab"
                      >
                        <Link45deg size={12} className="me-1" />
                        {getDisplayUrl()}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {formatLastChecked(service.last_checked)}
                      </div>
                    </div>

                    <div className="d-flex gap-1">
                      <Button
                        variant="link"
                        size="sm"
                        className="p-1 text-secondary"
                        onClick={() => onRefreshHealth(service.id)}
                        title="Refresh health status"
                      >
                        <ArrowRepeat size={14} />
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-1 text-primary"
                        onClick={handleEdit}
                        title="Edit service"
                      >
                        <PencilSquare size={14} />
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-1 text-danger"
                        onClick={handleDelete}
                        title="Delete service"
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                </>
              </div>
            </Card.Body>
          </Card>
        )}
      </Draggable>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this service?
          <br />
          This will permanently delete <strong>"{service.name}"</strong>.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ServiceItem;
