import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';

// Using CSS classes from the UI toolkit

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

  const getStatusVariant = (status) => {
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
    <Draggable draggableId={service.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`card transition-all ${snapshot.isDragging ? 'shadow-xl scale-105' : 'shadow-md hover:shadow-lg'}`}
        >
          <div className="card-body">
            <div className="d-flex align-start gap-md">
              <div 
                {...provided.dragHandleProps} 
                className="cursor-move text-tertiary hover:text-primary p-xs rounded"
                title="Drag to reorder"
              >
                ⋮⋮
              </div>

              <div className="flex-1">
                {isEditing ? (
                  <form onSubmit={handleSave} className="d-flex flex-column gap-md">
                    <input
                      className="input"
                      placeholder="Service Name"
                      value={editForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      autoFocus
                    />
                    <input
                      className="input"
                      placeholder="IP Address or hostname"
                      value={editForm.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      required
                    />
                    <input
                      className="input"
                      type="number"
                      placeholder="Port (optional)"
                      value={editForm.port}
                      onChange={(e) => handleInputChange('port', e.target.value)}
                    />
                    <div className="d-flex gap-sm">
                      <button type="submit" className="btn btn-primary btn-sm">
                        Save
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="d-flex align-center justify-between mb-md">
                      <h3 className="card-title mb-0 cursor-pointer" onClick={handleServiceClick}>
                        {service.name}
                      </h3>
                      <span className={`badge badge-${getStatusVariant(service.status)}`}>
                        {getStatusIcon(service.status)} {getStatusText(service.status)}
                      </span>
                    </div>

                    <div className="mb-md">
                      <div 
                        className="text-primary cursor-pointer hover:underline mb-xs" 
                        onClick={handleServiceClick}
                        title="Click to open in new tab"
                      >
                        <strong>🔗 {service.address}{service.port ? `:${service.port}` : ''}</strong>
                      </div>
                      <div className="text-sm text-tertiary">
                        Last checked: {formatLastChecked(service.last_checked)}
                      </div>
                    </div>

                    <div className="d-flex gap-xs">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => onRefreshHealth(service.id)}
                        title="Refresh health status"
                      >
                        🔄 Refresh
                      </button>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={handleEdit}
                        title="Edit service"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => onDelete(service.id)}
                        title="Delete service"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default ServiceItem;
