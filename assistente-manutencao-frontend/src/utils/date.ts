import { isValid, format, parseISO as dateFnsParseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    // Adiciona uma verificação para datas inválidas que podem vir da API como "0001-01-01T00:00:00Z"
    // ou se new Date() falhar em parsear uma string malformada.
    if (!isValid(date) || date.getFullYear() < 1900) { // isValid do date-fns, ou adicione sua própria lógica
        return 'Data inválida';
    }
    // Usar toLocaleDateString é bom, mas para consistência com date-fns e melhor controle:
    try {
        return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (e) {
        // Fallback se format falhar (improvável com isValid)
        return date.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
}

export function formatDateTime(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (!isValid(date) || date.getFullYear() < 1900) {
        return 'Data/Hora inválida';
    }
    try {
        return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (e) {
        return date.toLocaleString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

export function formatDateToISO(date: Date): string {
    if (!isValid(date)) return ''; // Retorna string vazia se a data for inválida
    return format(date, 'yyyy-MM-dd');
}

export function parseISODate(dateString: string): Date {

    if (!dateString) return new Date(NaN); // Retorna Invalid Date se a string for vazia

    // Tenta parsear com date-fns, que é mais robusto
    const parsedWithDateFns = dateFnsParseISO(dateString);
    if (isValid(parsedWithDateFns)) return parsedWithDateFns;
    const dateWithTimezone = dateString.includes('T') ? dateString : dateString + 'T00:00:00.000Z';
    const parsedDate = new Date(dateWithTimezone);
    return isValid(parsedDate) ? parsedDate : new Date(NaN); // Retorna Invalid Date se falhar
}


export function isDateInPast(dateString: string): boolean {
    const date = parseISODate(dateString); // Usar parseISODate para consistência
    if (!isValid(date)) return false; // Tratar datas inválidas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

export function getDaysUntilDate(dateString: string): number {
    const date = parseISODate(dateString); // Usar parseISODate
    if (!isValid(date)) return NaN; // Retornar NaN para datas inválidas
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normaliza para o início do dia
    // Garante que a data comparada também esteja no início do dia para evitar problemas de fuso/hora
    const targetDateNormalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffTime = targetDateNormalized.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getUrgencyStatus(proximaManutencao: string | null): 'atrasada' | 'urgente' | 'proxima' | 'ok' {
    if (!proximaManutencao) return 'ok';

    const days = getDaysUntilDate(proximaManutencao);
    if (isNaN(days)) return 'ok'; // Se getDaysUntilDate retornou NaN (data inválida)

    if (days < 0) return 'atrasada';
    if (days <= 7) return 'urgente';
    if (days <= 30) return 'proxima';
    return 'ok';
}