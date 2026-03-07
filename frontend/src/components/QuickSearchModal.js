import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, List, Avatar, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getServiceIcon, getServiceUrl } from '../utils/serviceUtils';

const { Text } = Typography;

function QuickSearchModal({ open, onClose, services, onSelect }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filtered = services.filter(
    (s) =>
      !query.trim() ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      (s.address && s.address.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex((i) => Math.min(i, Math.max(0, filtered.length - 1)));
  }, [filtered.length, query]);

  const handleSelect = (service) => {
    const url = getServiceUrl(service);
    if (url) {
      window.open(url, '_blank');
      onSelect?.(service);
    }
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={480}
      styles={{
        body: { padding: 0 },
        content: { paddingBottom: 0 },
      }}
    >
      <div style={{ padding: 12 }}>
        <Input
          ref={inputRef}
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          placeholder="Search services..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          size="large"
          variant="borderless"
          autoComplete="off"
          style={{
            fontSize: 16,
            padding: '8px 12px',
          }}
        />
      </div>
      <List
        ref={listRef}
        dataSource={filtered}
        style={{
          maxHeight: 320,
          overflow: 'auto',
          padding: '0 12px 12px',
        }}
        renderItem={(service, index) => {
          const isSelected = index === selectedIndex;
          const url = getServiceUrl(service);
          return (
            <List.Item
              style={{
                cursor: url ? 'pointer' : 'default',
                padding: '10px 12px',
                borderRadius: 8,
                background: isSelected ? '#f0f7ff' : 'transparent',
              }}
              onClick={() => url && handleSelect(service)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    size={36}
                    style={{ backgroundColor: '#1677ff', fontSize: 16 }}
                  >
                    {getServiceIcon(service.name)}
                  </Avatar>
                }
                title={<Text strong>{service.name}</Text>}
                description={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {url?.replace(/^https?:\/\//, '') || 'No URL'}
                  </Text>
                }
              />
            </List.Item>
          );
        }}
      />
      {filtered.length === 0 && (
        <div
          style={{
            padding: 24,
            textAlign: 'center',
            color: '#8c8c8c',
          }}
        >
          <Text type="secondary">No services match "{query}"</Text>
        </div>
      )}
    </Modal>
  );
}

export default QuickSearchModal;
