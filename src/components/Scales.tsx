import React, { useState, useEffect } from 'react';
import './Scales.css';
import { getScale } from '../ipc-bridge/scale';
import CreateScaleModal from './createScaleModal/CreateScaleModal';
import EditManualModal from './createScaleModal/EditManualModal'; // Modal de edição manual
import { CreateScaleResult } from '../../electron/preload/services/scale';

export type ScaleShift = {
  dateStr: string;
  employee_name: string;
  employee_id: string;
  scaleType: "ETA" | "PLANTAO_TARDE";
}

const Scales: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState<ScaleShift[]>([]);

  // IDs das escalas
  const [scaleIds, setScaleIds] = useState({ ETA: null, PLANTAO_TARDE: null });

  // Controle do modal de edição
  const [editModal, setEditModal] = useState<{ isOpen: boolean; date: string | null }>({ isOpen: false, date: null });

  // Trigger manual para recarregar dados
  const [refreshKey, setRefreshKey] = useState(0);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const fetchScale = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const monthString = `${year}-${month}`;

      const [etaResult, plantaoResult] = await Promise.all([
        getScale({ month: monthString, type: 'ETA' }),
        getScale({ month: monthString, type: 'PLANTAO_TARDE' })
      ]);

      // Atualiza IDs
      setScaleIds({
        ETA: etaResult?.id || null,
        PLANTAO_TARDE: plantaoResult?.id || null
      });

      const hasRealData =
        (etaResult?.shifts?.length ?? 0) > 0 ||
        (plantaoResult?.shifts?.length ?? 0) > 0;

      if (hasRealData) {
        const allShifts: ScaleShift[] = [];

        type DatabaseShift = {
          date: string; // yyyy-MM-dd
          employee_function: string;
          employee_id: string;
          employee_name: string;
          id: string;
        }

        allShifts.push(
          ...(etaResult.shifts as DatabaseShift[]).map(dbShift => ({
            dateStr: dbShift.date,
            employee_name: dbShift.employee_name,
            employee_id: dbShift.employee_id,
            scaleType: "ETA" as const
          }))
        );
        allShifts.push(
          ...(plantaoResult.shifts as DatabaseShift[]).map(dbShift => ({
            dateStr: dbShift.date,
            employee_name: dbShift.employee_name,
            employee_id: dbShift.employee_id,
            scaleType: "PLANTAO_TARDE" as const
          }))
        );

        setShifts(allShifts);
      }
    } catch (error) {
      console.error("Erro ao buscar escala:", error);
      // Se der erro no fetch, não necessariamente devemos limpar shifts (modo teste)
      setScaleIds({ ETA: null, PLANTAO_TARDE: null });
    }
  };

  // ------ BUSCA ESCALAS QUANDO MÊS MUDA OU REFRESH É SOLICITADO ------
  useEffect(() => {
    fetchScale();
  }, [currentDate, refreshKey]);

  // ------ Trocar Mês ------
  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  // ------ Abrir modal ao clicar no dia ------
  const handleDayClick = (dateStr: string) => {
    setEditModal({ isOpen: true, date: dateStr });
  };

  // ------ Recebe resultado da CRIAÇÃO da escala ------
  const handleCreateScale = async (result: CreateScaleResult) => {
    try {
      if (!result.success) {
        return alert(result.errorMessage);
      }

      // setShifts(result.shifts);
      console.log(result.shifts);
      await fetchScale();
    } catch (error) {
      console.error("Erro ao criar escala:", error);
      alert("Erro ao criar escala. Tente novamente.");
    }
  };

  // ------ Renderizar dias do calendário ------
  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDayIndex = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const formatDateStr = (y: number, m: number, d: number) => {
      const mm = String(m + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      return `${y}-${mm}-${dd}`;
    };

    const cells: any[] = [];

    // Dias do mês anterior
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startDayIndex; i > 0; i--) {
      const dayNum = prevMonthDays - i + 1;
      const dObj = new Date(year, month - 1, dayNum);
      cells.push({
        dateStr: formatDateStr(dObj.getFullYear(), dObj.getMonth(), dObj.getDate()),
        day: dayNum,
        isCurrentMonth: false
      });
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({
        dateStr: formatDateStr(year, month, day),
        day,
        isCurrentMonth: true
      });
    }

    // Preenche final
    const totalNeeded = startDayIndex + daysInMonth;
    const target = totalNeeded > 35 ? 42 : 35;
    const toAdd = target - cells.length;

    for (let i = 1; i <= toAdd; i++) {
      const dObj = new Date(year, month + 1, i);
      cells.push({
        dateStr: formatDateStr(dObj.getFullYear(), dObj.getMonth(), dObj.getDate()),
        day: i,
        isCurrentMonth: false
      });
    }

    // Elementos JSX
    const elements = cells.map((cell, idx) => {
      const todayStr = formatDateStr(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()
      );

      const isToday = cell.dateStr === todayStr;

      const dailyShifts = shifts.filter(s => s.dateStr === cell.dateStr);

      return (
        <div
          key={idx}
          className={`day-cell ${!cell.isCurrentMonth ? 'inactive' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => handleDayClick(cell.dateStr)}
        >
          <div className="day-number">{cell.day}</div>
          <div className="day-events">
            {dailyShifts.map((shift, i) => {
              const backgroundColor = shift.scaleType === 'ETA' ? '#FFE599' : '#6FA8DC';
              const textColor = shift.scaleType === 'ETA' ? '#000' : '#fff';

              return (
                <div
                  key={i}
                  className="event-block"
                  style={{ backgroundColor, color: textColor }}
                  title={`${shift.employee_name} - ${shift.scaleType}`}
                >
                  {shift.employee_name}
                </div>
              );
            })}
          </div>
        </div>
      );
    });

    // Quebrar em semanas
    const rows = [];
    for (let i = 0; i < elements.length; i += 7) {
      rows.push(
        <div key={i} className="calendar-week-row">
          {elements.slice(i, i + 7)}
        </div>
      );
    }

    return rows;
  };

  const monthStr = currentDate.toLocaleDateString('pt-BR', { month: 'long' });
  const monthCap = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);
  const yearStr = currentDate.getFullYear();

  return (
    <div className="scales-page-container">
      <div className="calendar-header-actions">
        <div className="calendar-nav">
          <button onClick={() => changeMonth(-1)} className="nav-button">❮</button>
          <h3 className="month-title">
            <span className="prefix-text">Escala Mensal -</span>
            <span className="month-text">{monthCap}</span>
            <span className="year-text">{yearStr}</span>
          </h3>
          <button onClick={() => changeMonth(1)} className="nav-button">❯</button>
        </div>

        <div className="action-buttons">
          <button className="btn-action primary" onClick={() => setIsCreateModalOpen(true)} disabled={!!scaleIds.ETA || !!scaleIds.PLANTAO_TARDE}>
            CRIAR ESCALA
          </button>
        </div>
      </div>

      <div className="calendar-grid-container">
        <div className="weekdays-header">
          {weekDays.map(day => <div key={day} className="weekday">{day}</div>)}
        </div>
        <div className="days-grid">{renderCalendarDays()}</div>
      </div>

      {/* Modal Criar Escala */}
      <CreateScaleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateScale}
        month={currentDate.getMonth() + 1}
        year={currentDate.getFullYear()}
      />

      {/* Modal Editar Manualmente */}
      <EditManualModal
        isOpen={editModal.isOpen}
        date={editModal.date}
        scaleIds={scaleIds}
        onClose={() => setEditModal({ isOpen: false, date: null })}
        onComplete={() => setRefreshKey(old => old + 1)} // Recarregar após salvar
      />
    </div>
  );
};

export default Scales;
