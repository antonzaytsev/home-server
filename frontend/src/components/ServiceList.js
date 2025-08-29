import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import ServiceItem from './ServiceItem';

const ServiceList = ({ services, onUpdate, onDelete, onRefreshHealth }) => {
  return (
    <Droppable droppableId="services">
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={`card-grid gap-lg ${snapshot.isDraggingOver ? 'bg-tertiary p-md rounded-lg' : ''}`}
        >
          {services.map((service, index) => (
            <ServiceItem
              key={service.id}
              service={service}
              index={index}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onRefreshHealth={onRefreshHealth}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default ServiceList;
