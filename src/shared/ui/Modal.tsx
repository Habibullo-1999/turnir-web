import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib/cn';
import { Button } from './Button';

/**
 * Нативный <dialog>: браузер сам даёт фокус-ловушку, backdrop и Esc — писать
 * это руками значит написать хуже.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'sm',
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'lg';
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  if (!open) return null;

  return createPortal(
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={cn(
        'bg-card border-line text-ink m-auto w-[calc(100vw-2rem)] rounded-2xl border p-6 shadow-2xl',
        'backdrop:bg-black/70 backdrop:backdrop-blur-sm',
        size === 'sm' ? 'max-w-md' : 'max-w-5xl',
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-ink text-lg font-bold">{title}</h2>
          {subtitle && <p className="text-ink-muted mt-1 text-sm">{subtitle}</p>}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Закрыть">
          ✕
        </Button>
      </div>

      {children}

      {footer && <div className="mt-6 flex flex-wrap gap-2">{footer}</div>}
    </dialog>,
    document.body,
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Подтвердить',
  variant = 'primary',
  pending,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  variant?: 'primary' | 'danger';
  pending?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={description}
      footer={
        <>
          <Button variant={variant} className="flex-1" disabled={pending} onClick={onConfirm}>
            {pending ? 'Выполняем…' : confirmLabel}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
        </>
      }
    />
  );
}
