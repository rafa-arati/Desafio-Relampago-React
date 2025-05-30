import { useState } from 'react';

interface UseConfirmDialogReturn {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    openConfirmDialog: (options: {
        title: string;
        message: string;
        onConfirm: () => void;
    }) => void;
    closeConfirmDialog: () => void;
}

export function useConfirmDialog(): UseConfirmDialogReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null);

    const openConfirmDialog = (options: {
        title: string;
        message: string;
        onConfirm: () => void;
    }) => {
        setTitle(options.title);
        setMessage(options.message);
        setConfirmCallback(() => options.onConfirm);
        setIsOpen(true);
    };

    const closeConfirmDialog = () => {
        setIsOpen(false);
        setTitle('');
        setMessage('');
        setConfirmCallback(null);
    };

    const handleConfirm = () => {
        if (confirmCallback) {
            confirmCallback();
        }
        closeConfirmDialog();
    };

    const handleCancel = () => {
        closeConfirmDialog();
    };

    return {
        isOpen,
        title,
        message,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
        openConfirmDialog,
        closeConfirmDialog,
    };
}