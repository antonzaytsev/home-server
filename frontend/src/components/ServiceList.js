import React from 'react';
// DnD removed
import ServiceItem from './ServiceItem';

const ServiceList = ({ services, onEdit, onDelete, onRefreshHealth }) => {
  return (
    <div className="grid">
      {services.map((service) => (
        <div key={service.id} className="gridItem">
          <ServiceItem
            service={service}
            onEdit={onEdit}
            onDelete={onDelete}
            onRefreshHealth={onRefreshHealth}
          />
        </div>
      ))}
    </div>
  );
};

export default ServiceList;
