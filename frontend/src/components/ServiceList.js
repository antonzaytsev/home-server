import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Row, Col } from 'react-bootstrap';
import ServiceItem from './ServiceItem';

const ServiceList = ({ services, onEdit, onDelete, onRefreshHealth }) => {
  return (
    <Droppable droppableId="services">
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={`p-${snapshot.isDraggingOver ? '3' : '0'} rounded transition-all`}
          style={{
            backgroundColor: snapshot.isDraggingOver ? '#f8f9fa' : 'transparent',
            transition: 'all 0.2s ease',
            minHeight: '100px'
          }}
        >
          <Row className="g-3">
            {services.map((service, index) => (
              <Col
                key={service.id}
                xs={12}
                sm={12}
                md={6}
                lg={4}
                xl={4}
              >
                <ServiceItem
                  service={service}
                  index={index}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onRefreshHealth={onRefreshHealth}
                />
              </Col>
            ))}
          </Row>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default ServiceList;
