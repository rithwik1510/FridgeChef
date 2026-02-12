'use client';

import { useEffect, useState } from 'react';
import { listsApi } from '@/lib/api';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useToast } from '@/components/ui/Toast';
import { Check, Trash, ListChecks, Warning, X } from '@phosphor-icons/react';
import type { ShoppingList, ShoppingListItem } from '@/types/api';
import { useAuthStore } from '@/store/auth';
import { demoShoppingLists } from '@/lib/demoData';
import { GUEST_DEMO_ENABLED } from '@/lib/demoMode';

interface ShoppingListItemWithIndex extends ShoppingListItem {
  index: number;
}

export default function ShoppingListsPage() {
  const { addToast } = useToast();
  const { isAuthenticated, hasHydrated, isLoading: isAuthLoading } = useAuthStore();
  const isGuestDemo = GUEST_DEMO_ENABLED && hasHydrated && !isAuthLoading && !isAuthenticated;
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    loadLists();
  }, [hasHydrated, isGuestDemo]);

  const loadLists = async () => {
    if (isGuestDemo) {
      setLists(demoShoppingLists);
      setSelectedList(demoShoppingLists[0] || null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await listsApi.list();
      setLists(data);
      if (data.length > 0 && !selectedList) {
        setSelectedList(data[0]);
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error loading lists',
        message: 'Could not load your shopping lists.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleItem = async (itemIndex: number) => {
    if (!selectedList) return;

    const updatedItems = selectedList.items.map((item: ShoppingListItem, index: number) => {
      if (index === itemIndex) {
        return { ...item, checked: !item.checked };
      }
      return item;
    });

    if (isGuestDemo) {
      const updated = { ...selectedList, items: updatedItems };
      setSelectedList(updated);
      setLists(lists.map((list) => list.id === updated.id ? updated : list));
      return;
    }

    try {
      const updated = await listsApi.update(selectedList.id, updatedItems);
      setSelectedList(updated);
      setLists(lists.map(list => list.id === updated.id ? updated : list));
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to update item' });
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (isGuestDemo) {
      addToast({
        type: 'info',
        title: 'Sign in to delete lists',
        message: 'Guest demo mode keeps list data read-only.',
      });
      setDeleteConfirm(null);
      return;
    }

    try {
      await listsApi.delete(listId);
      const newLists = lists.filter(list => list.id !== listId);
      setLists(newLists);
      if (selectedList?.id === listId) {
        setSelectedList(newLists[0] || null);
      }
      addToast({ type: 'success', title: 'List deleted' });
    } catch {
      addToast({ type: 'error', title: 'Failed to delete list' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const confirmDelete = (listId: string) => {
    setDeleteConfirm(listId);
  };

  const checkedCount = selectedList?.items?.filter((item: ShoppingListItem) => item.checked).length || 0;
  const totalCount = selectedList?.items?.length || 0;
  const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl mb-1">Shopping Lists</h1>
        <p className="text-charcoal/70">
          {lists.length} list{lists.length !== 1 ? 's' : ''}
        </p>
      </div>

      {isGuestDemo && (
        <Card variant="glass" className="border border-terracotta/20">
          <p className="text-sm text-charcoal/80 text-center mb-0">
            Guest demo mode: list data is sample content. Sign in to create and sync your own lists.
          </p>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-terracotta rounded-full animate-bounce-dot" />
            <div className="w-2 h-2 bg-terracotta rounded-full animate-bounce-dot-delay-1" />
            <div className="w-2 h-2 bg-terracotta rounded-full animate-bounce-dot-delay-2" />
          </div>
        </div>
      ) : lists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Lists Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            {lists.map((list) => {
              const listCheckedCount = list.items?.filter((item: ShoppingListItem) => item.checked).length || 0;
              const listTotalCount = list.items?.length || 0;
              const listProgress = listTotalCount > 0 ? Math.round((listCheckedCount / listTotalCount) * 100) : 0;

              return (
                <Card
                  key={list.id}
                  variant={selectedList?.id === list.id ? 'elevated' : 'default'}
                  hover
                  compact
                  onClick={() => setSelectedList(list)}
                  className={selectedList?.id === list.id ? 'ring-2 ring-terracotta' : ''}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <ListChecks size={18} className="text-terracotta" weight="duotone" />
                      <h3 className="font-semibold">{list.name}</h3>
                    </div>
                    <IconButton
                      icon={<Trash size={16} weight="bold" />}
                      label="Delete list"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(list.id);
                      }}
                      className="text-charcoal/40 hover:text-red-500"
                    />
                  </div>
                  <p className="text-xs text-charcoal/60 mb-2">
                    {listCheckedCount} of {listTotalCount} items
                  </p>
                  <ProgressBar value={listProgress} size="sm" variant="gradient" />
                </Card>
              );
            })}
          </div>

          {/* Selected List Detail */}
          {selectedList && (
            <div className="lg:col-span-2">
              <Card variant="elevated">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold mb-3">{selectedList.name}</h2>
                  <ProgressBar
                    value={progress}
                    size="md"
                    variant="gradient"
                    showLabel
                    label={`${checkedCount} of ${totalCount} items`}
                  />
                </div>

                {/* Group items by category */}
                {selectedList.items && selectedList.items.length > 0 ? (
                  <div className="space-y-5">
                    {Object.entries(
                      selectedList.items.reduce((acc: Record<string, ShoppingListItemWithIndex[]>, item: ShoppingListItem, index: number) => {
                        const category = item.category || 'Other';
                        if (!acc[category]) acc[category] = [];
                        acc[category].push({ ...item, index });
                        return acc;
                      }, {})
                    ).map(([category, items]) => (
                      <div key={category}>
                        <h3 className="text-sm font-semibold text-charcoal/60 uppercase tracking-wide mb-2">
                          {category}
                        </h3>
                        <ul className="space-y-1">
                          {items.map((item) => (
                            <li
                              key={item.index}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream-dark cursor-pointer transition-all duration-200"
                              onClick={() => handleToggleItem(item.index)}
                            >
                              <div
                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                                  item.checked
                                    ? 'bg-sage border-sage scale-110'
                                    : 'border-charcoal/30 hover:border-sage'
                                }`}
                              >
                                {item.checked && (
                                  <Check size={14} weight="bold" className="text-cream" />
                                )}
                              </div>
                              <span
                                className={`flex-1 transition-all duration-200 ${
                                  item.checked
                                    ? 'line-through text-charcoal/40'
                                    : 'text-charcoal'
                                }`}
                              >
                                {item.name}
                              </span>
                              <span className="text-sm text-charcoal/50">{item.amount}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-charcoal/60 py-8">No items in this list</p>
                )}
              </Card>
            </div>
          )}
        </div>
      ) : (
        <Card variant="elevated">
          <EmptyState
            variant="no-lists"
            onAction={() => {}}
          />
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-cream rounded-2xl p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Warning size={24} weight="duotone" className="text-red-500" />
              </div>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="p-1 hover:bg-cream-dark rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={20} className="text-charcoal/50" />
              </button>
            </div>

            <h3 className="text-xl font-semibold text-charcoal mb-2">
              Delete Shopping List?
            </h3>
            <p className="text-charcoal/70 mb-6">
              This action cannot be undone. All items in this list will be permanently removed.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => handleDeleteList(deleteConfirm)}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
