import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert'; 
import { useNotification } from '../../contexts/NotificationContext'; 

const GlobalSnackbar: React.FC = () => {
    const { notificationState, closeNotification } = useNotification();

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        closeNotification();
    };

    // Não renderiza o Snackbar se notificationState.open for false
    if (!notificationState.open) {
        return null;
    }

    return (
        <Snackbar
            open={notificationState.open}
            autoHideDuration={notificationState.autoHideDuration}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert
                onClose={handleClose} // Adiciona o botão 'x' para fechar
                severity={notificationState.severity}
                variant="filled"
                sx={{ width: '100%', boxShadow: 6 }} // Adiciona sombra para destaque
            >
                {notificationState.message}
            </Alert>
        </Snackbar>
    );
};

export default GlobalSnackbar;