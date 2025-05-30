import { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Paper,
    Typography,
    Stack,
    CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { Ativo, CriarAtivoDto, AtualizarAtivoDto } from '../../types';

interface AtivoFormProps {
    ativo?: Ativo;
    onSubmit: (dados: CriarAtivoDto | AtualizarAtivoDto) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export function AtivoForm({ ativo, onSubmit, onCancel, loading = false }: AtivoFormProps) {
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (ativo) {
            setFormData({
                nome: ativo.nome,
                descricao: ativo.descricao || '',
            });
        }
    }, [ativo]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.nome.trim()) {
            newErrors.nome = 'Nome é obrigatório';
        } else if (formData.nome.length > 100) {
            newErrors.nome = 'Nome deve ter no máximo 100 caracteres';
        }

        if (formData.descricao && formData.descricao.length > 500) {
            newErrors.descricao = 'Descrição deve ter no máximo 500 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const dados = {
                nome: formData.nome.trim(),
                descricao: formData.descricao.trim() || undefined,
            };

            await onSubmit(dados);
        } catch (error) {
            console.error('Erro ao salvar ativo:', error);
        }
    };

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));

        // Limpar erro do campo quando usuário começar a digitar
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                {ativo ? 'Editar Ativo' : 'Novo Ativo'}
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <Stack spacing={3}>
                    <TextField
                        label="Nome do Ativo"
                        variant="outlined"
                        fullWidth
                        required
                        value={formData.nome}
                        onChange={handleChange('nome')}
                        error={!!errors.nome}
                        helperText={errors.nome}
                        disabled={loading}
                        placeholder="Ex: Carro Honda Civic, Ar Condicionado Escritório"
                    />

                    <TextField
                        label="Descrição"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.descricao}
                        onChange={handleChange('descricao')}
                        error={!!errors.descricao}
                        helperText={errors.descricao || 'Informações adicionais sobre o ativo (opcional)'}
                        disabled={loading}
                        placeholder="Ex: Honda Civic 2020, placa ABC-1234, cor prata"
                    />

                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Paper>
    );
}