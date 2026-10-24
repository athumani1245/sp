import React, { useState } from 'react';
import { Modal, List, Input, Button, Space, Empty, Skeleton } from 'antd';
import { PlusOutlined, DeleteOutlined, TagsOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  useExpenseCategories,
  useAddExpenseCategory,
  useUpdateExpenseCategory,
  useDeleteExpenseCategory,
} from '../../hooks/useExpenseCategories';
import type { ExpenseCategory } from '../../services/expenseCategoryService';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CategoryRowProps {
  category: ExpenseCategory;
  onRename: (id: string, name: string) => void;
  onDelete: (category: ExpenseCategory) => void;
}

const CategoryRow: React.FC<CategoryRowProps> = ({ category, onRename, onDelete }) => {
  const [value, setValue] = useState(category.name);

  const commit = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setValue(category.name);
      return;
    }
    if (trimmed !== category.name) {
      onRename(category.id, trimmed);
    }
  };

  return (
    <List.Item
      actions={[
        <Button
          key="delete"
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => onDelete(category)}
        />,
      ]}
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onPressEnter={(e) => (e.target as HTMLInputElement).blur()}
        maxLength={40}
        variant="borderless"
      />
    </List.Item>
  );
};

const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [newCategoryName, setNewCategoryName] = useState('');

  const { data: categories, isLoading } = useExpenseCategories();
  const addCategoryMutation = useAddExpenseCategory();
  const updateCategoryMutation = useUpdateExpenseCategory();
  const deleteCategoryMutation = useDeleteExpenseCategory();

  const handleAdd = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    addCategoryMutation.mutate(name, {
      onSuccess: () => setNewCategoryName(''),
    });
  };

  const handleRename = (id: string, name: string) => {
    updateCategoryMutation.mutate({ id, name });
  };

  const handleDelete = (category: ExpenseCategory) => {
    Modal.confirm({
      title: t('expenses:manageCategories.deleteCategory'),
      content: t('expenses:manageCategories.deleteCategoryConfirm', { name: category.name }),
      okText: t('expenses:expenses.delete'),
      okType: 'danger',
      cancelText: t('expenses:expenses.cancel'),
      onOk: () => deleteCategoryMutation.mutate(category.id),
    });
  };

  return (
    <Modal
      title={
        <span>
          <TagsOutlined style={{ marginRight: 8 }} />
          {t('expenses:manageCategories.title')}
        </span>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={480}
    >
      <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
        <Input
          placeholder={t('expenses:manageCategories.newCategoryPlaceholder')}
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onPressEnter={handleAdd}
          maxLength={40}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          loading={addCategoryMutation.isPending}
          disabled={!newCategoryName.trim()}
        >
          {t('expenses:manageCategories.add')}
        </Button>
      </Space.Compact>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : (
        <List
          dataSource={categories || []}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t('expenses:manageCategories.emptyDescription')}
              />
            ),
          }}
          renderItem={(category) => (
            <CategoryRow
              key={category.id}
              category={category}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          )}
        />
      )}
    </Modal>
  );
};

export default ManageCategoriesModal;
