import React, { useState, useEffect } from 'react';
import {
    Box, TextField, Button, Paper, Typography, Stack, CircularProgress,
    MenuItem, FormControl, InputLabel, Select, FormHelperText, SelectChangeEvent,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ptBR } from 'date-fns/locale';
import { isValid } from 'date-fns';
import { Ativo, Manutencao, FormularioManutencaoData, CriarManutencaoDto, AtualizarManutencaoDto } from '../../types';
import { ativosService } from '../../services/ativos';
import { useApi } from '../../hooks/useApi';
import { formatDateToISO, parseISODate } from '../../utils/date';

interface ManutencaoFormProps {
    manutencao?: Manutencao;
    ativoIdSelecionado?: number;
    onSubmit: (dados: CriarManutencaoDto | AtualizarManutencaoDto) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export function ManutencaoForm({
    manutencao,
    ativoIdSelecionado,
    onSubmit,
    onCancel,
    loading = false
}: ManutencaoFormProps) {
    const [formData, setFormData] = useState<FormularioManutencaoData>({
        ativo_id: '', tipo_servico: '', data_realizada: '', descricao: '', proxima_manutencao: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { data: ativos, loading: loadingAtivosList, execute: carregarAtivos } = useApi<Ativo[]>(ativosService.listarAtivos);
    const inputLabelId = "ativo-select-label"; // Definido aqui

    useEffect(() => { carregarAtivos(); }, [carregarAtivos]);

    useEffect(() => {
        if (manutencao) {
            setFormData({
                ativo_id: manutencao.ativo_id.toString(), tipo_servico: manutencao.tipo_servico || '',
                data_realizada: manutencao.data_realizada ? manutencao.data_realizada.split('T')[0] : '',
                descricao: manutencao.descricao || '',
                proxima_manutencao: manutencao.proxima_manutencao ? manutencao.proxima_manutencao.split('T')[0] : '',
            });
        } else if (ativoIdSelecionado) {
            if (ativos && ativos.some(a => a.id === ativoIdSelecionado)) {
                setFormData(prev => ({ ...prev, ativo_id: ativoIdSelecionado.toString() }));
            } else if (!loadingAtivosList) { setFormData(prev => ({ ...prev, ativo_id: '' })); }
        } else { setFormData(prev => ({ ...prev, ativo_id: '', tipo_servico: '', data_realizada: '', descricao: '', proxima_manutencao: '' })); }
    }, [manutencao, ativoIdSelecionado, ativos, loadingAtivosList]);

    const validateFormInternal = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.ativo_id) newErrors.ativo_id = 'Ativo é obrigatório';
        if (!formData.tipo_servico.trim()) newErrors.tipo_servico = 'Tipo de serviço é obrigatório';
        if (formData.tipo_servico.trim().length > 255) newErrors.tipo_servico = 'Tipo de serviço deve ter no máximo 255 caracteres';
        if (!formData.data_realizada) { newErrors.data_realizada = 'Data realizada é obrigatória'; }
        else { const drd = parseISODate(formData.data_realizada); if (!isValid(drd)) newErrors.data_realizada = 'Data realizada inválida'; }
        if (formData.proxima_manutencao) {
            const pmd = parseISODate(formData.proxima_manutencao);
            if (!isValid(pmd)) { newErrors.proxima_manutencao = 'Data da próxima manutenção inválida'; }
            else if (formData.data_realizada && isValid(parseISODate(formData.data_realizada))) {
                const drdv = parseISODate(formData.data_realizada);
                if (pmd <= drdv) { newErrors.proxima_manutencao = 'Próxima manutenção deve ser após a data realizada'; }
            }
        }
        if (formData.descricao && formData.descricao.length > 1000) { newErrors.descricao = 'Descrição deve ter no máximo 1000 caracteres'; }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmitInternal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateFormInternal()) return;
        const baseDados = {
            tipo_servico: formData.tipo_servico.trim(), data_realizada: formData.data_realizada,
            descricao: formData.descricao?.trim() || undefined, proxima_manutencao: formData.proxima_manutencao?.trim() || undefined,
        };
        if (manutencao && manutencao.id) { await onSubmit(baseDados as AtualizarManutencaoDto); }
        else { await onSubmit({ ...baseDados, ativo_id: Number(formData.ativo_id) } as CriarManutencaoDto); }
    };

    type FormTextFieldKey = 'tipo_servico' | 'descricao';
    const handleInputChangeInternal = (field: FormTextFieldKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value; setFormData(prev => ({ ...prev, [field]: value })); if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };
    const handleSelectChangeInternal = (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target; setFormData(prev => ({ ...prev, [name as string]: value })); if (errors[name as string]) setErrors(prev => ({ ...prev, [name as string]: '' }));
    };
    type FormDateFieldKey = 'data_realizada' | 'proxima_manutencao';
    const handleDateChangeInternal = (field: FormDateFieldKey) => (date: Date | null) => {
        setFormData(prev => ({ ...prev, [field]: date && isValid(date) ? formatDateToISO(date) : '' })); if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const isSelectDisabled = loading || loadingAtivosList || !!manutencao;

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>{manutencao ? 'Editar Manutenção' : 'Nova Manutenção'}</Typography>
            <Box component="form" onSubmit={handleSubmitInternal} sx={{ mt: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                    <Stack spacing={3}>
                        <FormControl fullWidth variant="outlined" error={!!errors.ativo_id} disabled={isSelectDisabled}>
                            <InputLabel id={inputLabelId}>Ativo*</InputLabel>
                            <Select
                                labelId={inputLabelId}
                                id="ativo_id_select_element" // ID único para o select
                                name="ativo_id"
                                value={formData.ativo_id}
                                onChange={handleSelectChangeInternal}
                                label="Ativo*" // Crucial para o OutlinedInput notch
                            // Não precisa de renderValue se o primeiro MenuItem é o placeholder
                            >
                                {/* Placeholder explícito como primeiro item.
                                    A prop 'disabled' no MenuItem espera um boolean.
                                    A expressão `!(ativos && ativos.length > 0)` é true se não há ativos (e não está carregando).
                                    `loadingAtivosList` é true se está carregando.
                                    O MenuItem deve ser clicável para mostrar "Nenhum ativo" se for o caso.
                                */}
                                <MenuItem value="" disabled={loadingAtivosList && !formData.ativo_id}>
                                    <em>
                                        {loadingAtivosList ? 'Carregando...' :
                                            (!ativos || ativos.length === 0) ? 'Nenhum ativo disponível' :
                                                'Selecione um ativo'}
                                    </em>
                                </MenuItem>
                                {ativos && ativos.map((ativoItem: Ativo) => (
                                    <MenuItem key={ativoItem.id} value={ativoItem.id.toString()}>
                                        {ativoItem.nome}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.ativo_id && <FormHelperText>{errors.ativo_id}</FormHelperText>}
                        </FormControl>
                        <TextField label="Tipo de Serviço" value={formData.tipo_servico} onChange={handleInputChangeInternal('tipo_servico')} error={!!errors.tipo_servico} helperText={errors.tipo_servico} disabled={loading} required fullWidth variant="outlined" placeholder="Ex: Troca de óleo" />
                        <DatePicker label="Data Realizada*" value={formData.data_realizada ? parseISODate(formData.data_realizada) : null} onChange={handleDateChangeInternal('data_realizada')} slotProps={{ textField: { fullWidth: true, variant: 'outlined', error: !!errors.data_realizada, helperText: errors.data_realizada, required: true } }} disabled={loading} />
                        <TextField label="Descrição" value={formData.descricao} onChange={handleInputChangeInternal('descricao')} error={!!errors.descricao} helperText={errors.descricao || 'Opcional'} disabled={loading} multiline rows={3} fullWidth variant="outlined" />
                        <DatePicker label="Próxima Manutenção" value={formData.proxima_manutencao ? parseISODate(formData.proxima_manutencao) : null} onChange={handleDateChangeInternal('proxima_manutencao')} minDate={formData.data_realizada && isValid(parseISODate(formData.data_realizada)) ? parseISODate(formData.data_realizada) : undefined} slotProps={{ textField: { fullWidth: true, variant: 'outlined', error: !!errors.proxima_manutencao, helperText: errors.proxima_manutencao } }} disabled={loading} />
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button variant="outlined" startIcon={<CancelIcon />} onClick={onCancel} disabled={loading}>Cancelar</Button>
                            <Button type="submit" variant="contained" startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} disabled={loading || loadingAtivosList}>{loading ? 'Salvando...' : 'Salvar Manutenção'}</Button>
                        </Stack>
                    </Stack>
                </LocalizationProvider>
            </Box>
        </Paper>
    );
}