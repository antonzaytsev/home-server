import React, { useState, useRef, useCallback } from 'react';
import ServiceItem from './ServiceItem';

const ServiceList = ({ services, onEdit, onDelete, onRefreshHealth, onReorder }) => {
  const [drag, setDrag] = useState(null); // { dragIndex, overIndex, left, top, width }
  const gridRef = useRef(null);
  const floatingRef = useRef(null);
  const dragDataRef = useRef(null);
  const overIndexRef = useRef(null);

  const handleDragStart = useCallback((e, serviceId) => {
    const dragIndex = services.findIndex(s => s.id === serviceId);
    if (dragIndex === -1) return;
    e.preventDefault();

    const gridItem = e.target.closest('.gridItem');
    if (!gridItem) return;
    const rect = gridItem.getBoundingClientRect();

    // Snapshot all slot centers for stable hit-testing
    const items = Array.from(gridRef.current.children);
    const slotCenters = items.map(item => {
      const r = item.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });

    dragDataRef.current = {
      dragIndex,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      slotCenters,
    };
    overIndexRef.current = dragIndex;

    setDrag({
      dragIndex,
      overIndex: dragIndex,
      left: rect.left,
      top: rect.top,
      width: rect.width,
    });

    document.body.style.userSelect = 'none';

    const onMove = (e) => {
      if (!dragDataRef.current) return;
      const { offsetX, offsetY, slotCenters, dragIndex } = dragDataRef.current;

      if (floatingRef.current) {
        floatingRef.current.style.left = `${e.clientX - offsetX}px`;
        floatingRef.current.style.top = `${e.clientY - offsetY}px`;
      }

      let closest = dragIndex;
      let minDist = Infinity;
      for (let i = 0; i < slotCenters.length; i++) {
        const dx = e.clientX - slotCenters[i].x;
        const dy = e.clientY - slotCenters[i].y;
        const d = dx * dx + dy * dy;
        if (d < minDist) { minDist = d; closest = i; }
      }

      if (closest !== overIndexRef.current) {
        overIndexRef.current = closest;
        setDrag(prev => prev ? { ...prev, overIndex: closest } : null);
      }
    };

    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.body.style.userSelect = '';

      const from = dragDataRef.current?.dragIndex;
      const to = overIndexRef.current;

      if (from != null && to != null && from !== to) {
        const arr = [...services];
        const [removed] = arr.splice(from, 1);
        arr.splice(to, 0, removed);
        onReorder({ previousServices: services, nextServices: arr });
      }

      dragDataRef.current = null;
      overIndexRef.current = null;
      setDrag(null);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }, [services, onReorder]);

  // Compute display order with dragged item at target position
  let displayItems = services;
  let draggedService = null;
  if (drag) {
    draggedService = services[drag.dragIndex];
    const arr = [...services];
    const [removed] = arr.splice(drag.dragIndex, 1);
    arr.splice(drag.overIndex, 0, removed);
    displayItems = arr;
  }

  return (
    <>
      <div className="grid" ref={gridRef}>
        {displayItems.map((service) => {
          const isDragged = draggedService && service.id === draggedService.id;
          return (
            <div key={service.id} className="gridItem">
              {isDragged ? (
                <div className="dropPlaceholder" />
              ) : (
                <ServiceItem
                  service={service}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onRefreshHealth={onRefreshHealth}
                  onDragHandleMouseDown={(e) => handleDragStart(e, service.id)}
                />
              )}
            </div>
          );
        })}
      </div>

      {drag && draggedService && (
        <div
          ref={floatingRef}
          className="floatingDragItem"
          style={{ left: drag.left, top: drag.top, width: drag.width }}
        >
          <ServiceItem
            service={draggedService}
            onEdit={() => {}}
            onDelete={() => {}}
            onRefreshHealth={() => {}}
            onDragHandleMouseDown={() => {}}
          />
        </div>
      )}
    </>
  );
};

export default ServiceList;
