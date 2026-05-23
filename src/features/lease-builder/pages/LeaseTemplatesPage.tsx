import React, { useState } from 'react';
import {
  Button, Table, Tag, Space, Typography, Card, Popconfirm,
  Tooltip, Row, Col, Statistic, Empty, Input,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined,
  SearchOutlined, EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useLeaseTemplates, useDeleteTemplate } from '../hooks/useLeaseTemplates';
import type { LeaseTemplate } from '../services/leaseTemplateService';

const { Title, Text } = Typography;

const LeaseTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: templates = [], isLoading } = useLeaseTemplates();
  const deleteTemplate = useDeleteTemplate();
  const [search, setSearch] = useState('');

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: 'Template Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <FileTextOutlined style={{ color: '#CC5B4B' }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Variables',
      dataIndex: 'variables',
      key: 'variables',
      render: (vars: string[]) => (
        <Space wrap size={4}>
          {vars.slice(0, 4).map((v) => (
            <Tag key={v} color="gold" style={{ fontFamily: 'monospace', fontSize: 11 }}>
              {`{{ ${v} }}`}
            </Tag>
          ))}
          {vars.length > 4 && (
            <Tooltip title={vars.slice(4).join(', ')}>
              <Tag color="default">+{vars.length - 4} more</Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Last Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 160,
      render: (date: string) => (
        <Text type="secondary">{dayjs(date).format('DD MMM YYYY')}</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_: any, record: LeaseTemplate) => (
        <Space>
          <Tooltip title="Generate Lease">
            <Button
              size="small"
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/lease-builder/${record.id}/generate`)}
            />
          </Tooltip>
          <Tooltip title="Edit Template">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/lease-builder/${record.id}/edit`)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete template?"
            description="This action cannot be undone."
            onConfirm={() => deleteTemplate.mutate(record.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={deleteTemplate.isPending}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>Contract Templates</Title>
          <Text type="secondary">Build and manage reusable contract document templates</Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/lease-builder/new')}
          >
            New Template
          </Button>
        </Col>
      </Row>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} md={6}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic
              title="Total Templates"
              value={templates.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#CC5B4B', fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic
              title="Total Variables"
              value={templates.reduce((sum, t) => sum + t.variables.length, 0)}
              valueStyle={{ fontSize: 24 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card
        style={{ borderRadius: 8 }}
        extra={
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search templates..."
            size="small"
            style={{ width: 220 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
      >
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  search
                    ? 'No templates match your search'
                    : 'No templates yet. Create your first template!'
                }
              >
                {!search && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/lease-builder/new')}
                  >
                    Create Template
                  </Button>
                )}
              </Empty>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default LeaseTemplatesPage;
