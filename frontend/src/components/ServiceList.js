import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Row, Col } from 'antd';
import ServiceItem from './ServiceItem';

const ServiceList = ({ services, onUpdate, onDelete, onRefreshHealth }) => {
  return (
    <Droppable droppableId="services">
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          style={{
            backgroundColor: snapshot.isDraggingOver ? '#f5f5f5' : 'transparent',
            padding: snapshot.isDraggingOver ? '16px' : '0',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            minHeight: '100px'
          }}
        >
          <Row gutter={[16, 16]}>
            {services.map((service, index) => (
              <Col
                key={service.id}
                xs={24}
                sm={24}
                md={12}
                lg={8}
                xl={6}
              >
                <ServiceItem
                  service={service}
                  index={index}
                  onUpdate={onUpdate}
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
