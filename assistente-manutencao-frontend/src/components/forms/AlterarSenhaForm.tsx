import React, { useState } from 'react';
import { Box, TextField, Button, Stack, CircularProgress, IconButton, InputAdornment, Alert } from '@mui/material';
import { Save as SaveIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { FormularioAlterarSenhaData, AlterarSenhaDto } from '../../types';

interface AlterarSenhaFormProps {
    onSubmit: (dados: AlterarSenhaDto) => Promise<void>;
    loading: boolean;
    errorApi?: string | null;
    onSuccess?: () => void;
}

export const AlterarSenhaForm: React.FC<AlterarSenhaFormProps> = ({
    onSubmit,
    loading,
    errorApi,
    onSuccess
}) => {
    const [formData, setFormData] = useState<FormularioAlterarSenhaData>({
        senhaAtual: '',
        novaSenha: '',
        confirmarNovaSenha: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [showSenhaAtual, setShowSenhaAtual] = useState(false);
    const [showNovaSenha, setShowNovaSenha] = useState(false);
    const [showConfirmarNovaSenha, setShowConfirmarNovaSenha] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);


    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.senhaAtual) newErrors.senhaAtual = 'Senha atual é obrigatória.';

        if (!formData.novaSenha) newErrors.novaSenha = 'Nova senha é obrigatória.';
        else if (formData.novaSenha.length < 6) newErrors.novaSenha = 'Nova senha deve ter pelo menos 6 caracteres.';

        if (!formData.confirmarNovaSenha) newErrors.confirmarNovaSenha = 'Confirmação da nova senha é obrigatória.';
        else if (formData.novaSenha !== formData.confirmarNovaSenha) newErrors.confirmarNovaSenha = 'As novas senhas não coincidem.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage(null);
        if (!validate()) return;

        const dadosParaEnviar: AlterarSenhaDto = {
            senhaAtual: formData.senhaAtual,
            novaSenha: formData.novaSenha,
        };
        try {
            await onSubmit(dadosParaEnviar);
            setSuccessMessage('Senha alterada com sucesso!');
            setFormData({ senhaAtual: '', novaSenha: '', confirmarNovaSenha: '' }); // Limpa o formulário
            if (onSuccess) onSuccess();
        } catch (error) {
            // Erro da API é tratado pela prop errorApi
        }
    };

    const handleChange = (field: keyof FormularioAlterarSenhaData) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData(prev => ({ ...prev, [field]: e.target.value }));
            if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
            if (successMessage) setSuccessMessage(null);
        };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
                {errorApi && <Alert severity="error">{errorApi}</Alert>}
                {successMessage && <Alert severity="success">{successMessage}</Alert>}

                <TextField
                    fullWidth
                    label="Senha Atual"
                    name="senhaAtual"
                    type={showSenhaAtual ? 'text' : 'password'}
                    value={formData.senhaAtual}
                    onChange={handleChange('senhaAtual')}
                    error={!!errors.senhaAtual}
                    helperText={errors.senhaAtual}
                    disabled={loading}
                    required
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowSenhaAtual(!showSenhaAtual)} edge="end">
                                    {showSenhaAtual ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    fullWidth
                    label="Nova Senha"
                    name="novaSenha"
                    type={showNovaSenha ? 'text' : 'password'}
                    value={formData.novaSenha}
                    onChange={handleChange('novaSenha')}
                    error={!!errors.novaSenha}
                    helperText={errors.novaSenha}
                    disabled={loading}
                    required
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowNovaSenha(!showNovaSenha)} edge="end">
                                    {showNovaSenha ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    fullWidth
                    label="Confirmar Nova Senha"
                    name="confirmarNovaSenha"
                    type={showConfirmarNovaSenha ? 'text' : 'password'}
                    value={formData.confirmarNovaSenha}
                    onChange={handleChange('confirmarNovaSenha')}
                    error={!!errors.confirmarNovaSenha}
                    helperText={errors.confirmarNovaSenha}
                    disabled={loading}
                    required
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowConfirmarNovaSenha(!showConfirmarNovaSenha)} edge="end">
                                    {showConfirmarNovaSenha ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    sx={{ alignSelf: 'flex-end' }}
                >
                    {loading ? 'Salvando...' : 'Alterar Senha'}
                </Button>
            </Stack>
        </Box>
    );
};