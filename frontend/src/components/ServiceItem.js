import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import './ServiceItem.css';

const ServiceItem = ({ service, index, onUpdate, onDelete, onRefreshHealth }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: service.name,
    address: service.address,
    port: service.port || ''
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      name: service.name,
      address: service.address,
      port: service.port || ''
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await onUpdate(service.id, {
      name: editForm.name,
      address: editForm.address,
      port: editForm.port ? parseInt(editForm.port) : null
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: service.name,
      address: service.address,
      port: service.port || ''
    });
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
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
    const url = `http://${service.address}${service.port ? `:${service.port}` : ''}`;
    window.open(url, '_blank');
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

  return (
    <Draggable draggableId={service.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`service-item ${snapshot.isDragging ? 'dragging' : ''}`}
        >
          <div {...provided.dragHandleProps} className="drag-handle">
            ⋮⋮
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="edit-form">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Service Name"
                  value={editForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="IP Address"
                  value={editForm.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  placeholder="Port (optional)"
                  value={editForm.port}
                  onChange={(e) => handleInputChange('port', e.target.value)}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-small">
                  Save
                </button>
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="btn btn-secondary btn-small"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="service-header">
                <h3 className="service-name">{service.name}</h3>
                <div className="service-status">
                  <span className="status-icon">{getStatusIcon(service.status)}</span>
                  <span className="status-text">{getStatusText(service.status)}</span>
                </div>
              </div>

              <div className="service-details">
                <div className="service-address" onClick={handleServiceClick}>
                  <span className="address-label">Address:</span>
                  <span className="address-value">
                    {service.address}{service.port ? `:${service.port}` : ''}
                  </span>
                </div>
                <div className="last-checked">
                  Last checked: {formatLastChecked(service.last_checked)}
                </div>
              </div>

              <div className="service-actions">
                <button
                  onClick={() => onRefreshHealth(service.id)}
                  className="btn btn-secondary btn-small"
                  title="Refresh health status"
                >
                  🔄
                </button>
                <button
                  onClick={handleEdit}
                  className="btn btn-secondary btn-small"
                  title="Edit service"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDelete(service.id)}
                  className="btn btn-danger btn-small"
                  title="Delete service"
                >
                  🗑️
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default ServiceItem;
