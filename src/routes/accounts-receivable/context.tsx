import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { Modal } from '../../shared/ui/Modal';
import { Select } from '../../shared/ui/Select';
import { useToast } from '../../shared/ui/Toast';
import { arData, createMoney, formatMoney } from './data';

interface AccountsReceivableContextValue {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  focusSearch: () => void;
  registerSearchInput: (node: HTMLInputElement | null) => void;
  data: typeof arData;
  openNewInvoice: () => void;
}

const AccountsReceivableContext = createContext<AccountsReceivableContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAccountsReceivable = () => {
  const context = useContext(AccountsReceivableContext);
  if (!context) {
    throw new Error('useAccountsReceivable must be used within AccountsReceivableProvider');
  }
  return context;
};

interface AccountsReceivableProviderProps {
  children: ReactNode;
}

export const AccountsReceivableProvider = ({ children }: AccountsReceivableProviderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);

  const registerSearchInput = useCallback((node: HTMLInputElement | null) => {
    searchRef.current = node;
  }, []);

  const focusSearch = useCallback(() => {
    searchRef.current?.focus();
  }, []);

  const openNewInvoice = useCallback(() => setIsNewInvoiceOpen(true), []);
  const closeNewInvoice = useCallback(() => setIsNewInvoiceOpen(false), []);

  const contextValue = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      focusSearch,
      registerSearchInput,
      data: arData,
      openNewInvoice
    }),
    [focusSearch, openNewInvoice, registerSearchInput, searchQuery]
  );

  return (
    <AccountsReceivableContext.Provider value={contextValue}>
      {children}
      <NewInvoiceModal isOpen={isNewInvoiceOpen} onClose={closeNewInvoice} />
    </AccountsReceivableContext.Provider>
  );
};

const NewInvoiceModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { data } = useAccountsReceivable();
  const { showToast } = useToast();
  const [customerId, setCustomerId] = useState(data.customers[0]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [memo, setMemo] = useState('');

  const reset = useCallback(() => {
    setAmount('');
    setDueDate('');
    setMemo('');
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!customerId || !amount) return;
      onClose();
      reset();
      showToast({
        variant: 'success',
        title: 'Invoice drafted',
        description: `Created draft for ${formatMoney(createMoney(Number(amount)))}`,
        action: {
          label: 'Open draft',
          onClick: () => {
            window.location.hash = '#invoice-draft';
          }
        }
      });
    },
    [amount, customerId, onClose, reset, showToast]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New invoice"
      description="Draft an invoice in seconds and route it for approval."
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted">
            Drafts auto-save. Need recurring billing? Enable automation rules.
          </p>
          <Button type="submit" form="ar-new-invoice" size="md">
            Create draft
          </Button>
        </div>
      }
    >
      <form id="ar-new-invoice" className="space-y-5" onSubmit={handleSubmit}>
        <Select
          label="Customer"
          value={customerId}
          onChange={(event) => setCustomerId(event.target.value)}
        >
          {data.customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </Select>
        <Input
          label="Invoice amount"
          type="number"
          min={0}
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
        />
        <Input
          label="Due date"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          required
        />
        <Input
          label="Memo"
          placeholder="Internal note (optional)"
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
        />
      </form>
    </Modal>
  );
};
