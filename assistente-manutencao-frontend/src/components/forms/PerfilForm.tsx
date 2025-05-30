import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Stack, CircularProgress, Alert } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { UsuarioSemSenha, FormularioPerfilData, AtualizarPerfilDto } from '../../types';

interface PerfilFormProps {
    usuario: UsuarioSemSenha;
    onSubmit: (dados: AtualizarPerfilDto) => Promise<void>;
    loading: boolean;
    errorApi?: string | null; // Erro vindo da API
    onSuccess?: () => void; // Callback em caso de sucesso
}

export const PerfilForm: React.FC<PerfilFormProps> = ({
    usuario,
    onSubmit,
    loading,
    errorApi,
    onSuccess
}) => {
    const [formData, setFormData] = useState<FormularioPerfilData>({
        nome: usuario.nome || '',
        email: usuario.email || '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        // Atualiza o formulário se a prop usuario mudar (ex: após salvar e o AuthContext atualizar)
        setFormData({
            nome: usuario.nome || '',
            email: usuario.email || '',
        });
    }, [usuario]);

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório.';
        else if (formData.nome.trim().length < 2) newErrors.nome = 'Nome deve ter pelo menos 2 caracteres.';

        if (!formData.email.trim()) newErrors.email = 'Email é obrigatório.';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Formato de email inválido.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage(null); // Limpa mensagem de sucesso anterior
        if (!validate()) return;

        const dadosParaEnviar: AtualizarPerfilDto = {};
        let mudancasFeitas = false;

        if (formData.nome.trim() !== usuario.nome) {
            dadosParaEnviar.nome = formData.nome.trim();
            mudancasFeitas = true;
        }
        if (formData.email.toLowerCase().trim() !== usuario.email) {
            dadosParaEnviar.email = formData.email.toLowerCase().trim();
            mudancasFeitas = true;
        }

        if (!mudancasFeitas) {
            setErrors({ geral: 'Nenhuma alteração detectada.' });
            return;
        }
        setErrors({}); // Limpa erro de "nenhuma alteração"

        try {
            await onSubmit(dadosParaEnviar);
            setSuccessMessage('Perfil atualizado com sucesso!');
            if (onSuccess) onSuccess();
        } catch (error) {
            // O erro da API já é tratado pela prop errorApi vinda da página
            // Mas podemos logar se quisermos
            console.error("Erro no PerfilForm ao submeter:", error);
        }
    };

    const handleChange = (field: keyof FormularioPerfilData) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData(prev => ({ ...prev, [field]: e.target.value }));
            if (errors[field] || errors.geral) setErrors(prev => ({ ...prev, [field]: '', geral: '' })); // Limpa erro específico e geral
            if (successMessage) setSuccessMessage(null); // Limpa mensagem de sucesso ao digitar
        };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
                {errorApi && <Alert severity="error">{errorApi}</Alert>}
                {errors.geral && <Alert severity="warning">{errors.geral}</Alert>}
                {successMessage && <Alert severity="success">{successMessage}</Alert>}

                <TextField
                    fullWidth
                    label="Nome Completo"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange('nome')}
                    error={!!errors.nome}
                    helperText={errors.nome}
                    disabled={loading}
                    required
                />
                <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={loading}
                    required
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    sx={{ alignSelf: 'flex-end' }}
                >
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </Stack>
        </Box>
    );
};