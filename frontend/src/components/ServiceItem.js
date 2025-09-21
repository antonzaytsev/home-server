import React, { useState } from 'react';
// Drag handle is provided by parent

const ServiceItem = ({ service, onEdit, onDelete, onRefreshHealth }) => {
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'healthy':
        return 'chip success';
      case 'unhealthy':
        return 'chip error';
      default:
        return 'chip warning';
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

  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes('home assistant') || name.includes('hass')) return '🏠';
    if (name.includes('plex')) return '🎬';
    if (name.includes('router') || name.includes('admin')) return '🌐';
    if (name.includes('dns')) return '🌍';
    if (name.includes('torrent') || name.includes('qbit')) return '⬇️';
    if (name.includes('jellyfin')) return '🍿';
    if (name.includes('cockpit')) return '⚙️';
    if (name.includes('portainer')) return '🐳';
    if (name.includes('calendar')) return '📅';
    if (name.includes('trading') || name.includes('charts')) return '📈';
    return '🖥️';
  };

  const handleServiceClick = () => {
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
      return;
    }

    window.open(url, '_blank');
  };

  const getDisplayUrl = () => {
    if (service.url) {
      return service.url.replace(/^https?:\/\//, '');
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


  return (
    <>
      <div className="card">
        <div className="cardContent">
          <div className="header">
            <div className="avatar">{getServiceIcon(service.name)}</div>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <div
                className="serviceName"
                onClick={handleServiceClick}
                title={service.name}
              >
                {service.name}
              </div>
            </div>
          </div>

          <div onClick={handleServiceClick} className="urlRow" title={getDisplayUrl()}>
            <span style={{ fontSize: 16, marginRight: 6 }}>🔗</span>
            <div className="urlText">{getDisplayUrl()}</div>
          </div>
        </div>

        <div className="cardActions">
          <div className={getStatusClass(service.status)}>
            <span style={{ fontSize: 14 }}>{service.status === 'healthy' ? '✔' : service.status === 'unhealthy' ? '✖' : '!'}</span>
            {getStatusText(service.status)}
          </div>

          <div className="actionsRight">
            <button className="iconButton" onClick={() => onRefreshHealth(service.id)} title="Refresh">⟲</button>
            <button className="iconButton" onClick={handleEdit} title="Edit" style={{ color: 'var(--primary)' }}>✎</button>
            <button className="iconButton" onClick={handleDelete} title="Delete" style={{ color: 'var(--error)' }}>🗑</button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="modalOverlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <div className="modalTitle">Delete Service</div>
              <button className="iconButton" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div style={{ marginBottom: 16 }}>
              Are you sure you want to delete this service?
              <div style={{ marginTop: 8, fontWeight: 700 }}>
                This will permanently delete "{service.name}".
              </div>
            </div>
            <div className="modalActions">
              <button className="button" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="button" style={{ background: 'var(--error)', color: '#fff', borderColor: 'var(--error)' }} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceItem;
