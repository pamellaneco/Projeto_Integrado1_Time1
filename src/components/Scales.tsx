import React, { useState, useEffect } from 'react';
import './Scales.css';
import { getScale, moveShiftDragDrop } from '../ipc-bridge/scale';
import CreateScaleModal from './createScaleModal/CreateScaleModal';
import EditManualModal from './createScaleModal/EditManualModal';
import ConfirmationModal from './modal/ConfirmationModal';
import { CreateScaleResult } from '../../electron/preload/services/scale';
import { differenceInCalendarMonths } from "date-fns";
import { DownloadScaleButton } from './publish-button';

export type ScaleShift = {
  dateStr: string;
  employee_name: string;
  employee_id: string;
  scaleType: "ETA" | "PLANTAO_TARDE";
  id?: string;
}

const Scales: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState<ScaleShift[]>([]);
  const [scaleIds, setScaleIds] = useState({ ETA: null, PLANTAO_TARDE: null });
  const [holidays, setHolidays] = useState<{ [key: string]: string }>({});

  const isHoliday = (dateStr: string): { isHoliday: boolean; name?: string } => {
    if (holidays[dateStr]) {
      return { isHoliday: true, name: holidays[dateStr] };
    }
    return { isHoliday: false };
  };
  const [editModal, setEditModal] = useState<{ isOpen: boolean; date: string | null }>({ isOpen: false, date: null });
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Estado para drag-and-drop
  const [draggedShift, setDraggedShift] = useState<ScaleShift | null>(null);
  const [dragError, setDragError] = useState<string | null>(null);
  const [validDropDates, setValidDropDates] = useState<Set<string>>(new Set());
  const [dragConflictModal, setDragConflictModal] = useState<{
    isOpen: boolean;
    message: string;
    pendingMove: any;
  }>({
    isOpen: false,
    message: '',
    pendingMove: null
  });

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

      setScaleIds({
        ETA: etaResult?.id || null,
        PLANTAO_TARDE: plantaoResult?.id || null
      });

      // Processar feriados vindos do backend
      console.log('=== DEBUG FERIADOS ===');
      console.log('ETA Result completo:', JSON.stringify(etaResult, null, 2));
      console.log('Plantao Result completo:', JSON.stringify(plantaoResult, null, 2));
      console.log('ETA keys:', etaResult ? Object.keys(etaResult) : 'null');
      console.log('Plantao keys:', plantaoResult ? Object.keys(plantaoResult) : 'null');
      
      const holidaysMap: { [key: string]: string } = {};
      
      // Tentar diferentes possíveis estruturas de dados
      if (etaResult?.holidays && Array.isArray(etaResult.holidays)) {
        console.log('✅ Feriados ETA encontrados:', etaResult.holidays);
        etaResult.holidays.forEach((holiday: any) => {
          console.log('Processando holiday ETA:', holiday);
          const dateKey = holiday.date || holiday.holiday_date;
          const name = holiday.name || holiday.holiday_name || 'Feriado';
          if (dateKey) {
            holidaysMap[dateKey] = name;
            console.log(`Adicionado: ${dateKey} = ${name}`);
          }
        });
      } else {
        console.log('❌ ETA não tem holidays ou não é array:', etaResult?.holidays);
      }
      
      if (plantaoResult?.holidays && Array.isArray(plantaoResult.holidays)) {
        console.log('✅ Feriados PLANTAO encontrados:', plantaoResult.holidays);
        plantaoResult.holidays.forEach((holiday: any) => {
          console.log('Processando holiday PLANTAO:', holiday);
          const dateKey = holiday.date || holiday.holiday_date;
          const name = holiday.name || holiday.holiday_name || 'Feriado';
          if (dateKey) {
            holidaysMap[dateKey] = name;
            console.log(`Adicionado: ${dateKey} = ${name}`);
          }
        });
      } else {
        console.log('❌ PLANTAO não tem holidays ou não é array:', plantaoResult?.holidays);
      }
      
      console.log('Holidays Map final:', JSON.stringify(holidaysMap, null, 2));
      console.log('Total de feriados:', Object.keys(holidaysMap).length);
      console.log('=== FIM DEBUG ===');
      setHolidays(holidaysMap);

      const hasRealData =
        (etaResult?.shifts?.length ?? 0) > 0 ||
        (plantaoResult?.shifts?.length ?? 0) > 0;

      if (hasRealData) {
        const allShifts: ScaleShift[] = [];

        type DatabaseShift = {
          dateStr: string;
          employee_function: string;
          employee_id: string;
          employee_name: string;
          id: string;
          scaleType?: string;
        }

        allShifts.push(
          ...(etaResult.shifts as DatabaseShift[]).map(dbShift => ({
            dateStr: dbShift.dateStr,
            employee_name: dbShift.employee_name,
            employee_id: dbShift.employee_id,
            scaleType: "ETA" as const,
            id: dbShift.id
          }))
        );
        allShifts.push(
          ...(plantaoResult.shifts as DatabaseShift[]).map(dbShift => ({
            dateStr: dbShift.dateStr,
            employee_name: dbShift.employee_name,
            employee_id: dbShift.employee_id,
            scaleType: "PLANTAO_TARDE" as const,
            id: dbShift.id
          }))
        );

        setShifts(allShifts);
      }
    } catch (error) {
      console.error("Erro ao buscar escala:", error);
      setScaleIds({ ETA: null, PLANTAO_TARDE: null });
    }
  };

  useEffect(() => {
    fetchScale();
  }, [currentDate, refreshKey]);

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const handleDayClick = (dateStr: string) => {
    setEditModal({ isOpen: true, date: dateStr });
  };

  const handleCreateScale = async (result: CreateScaleResult) => {
    try {
      if (!result.success) {
        return alert(result.errorMessage);
      }
      await fetchScale();
    } catch (error) {
      console.error("Erro ao criar escala:", error);
      alert("Erro ao criar escala. Tente novamente.");
    }
  };

  // Verifica se um funcionário já tem alocação na data alvo (colisão)
  const hasCollision = (employeeId: string, targetDate: string, sourceDate: string): boolean => {
    return shifts.some(shift =>
      shift.employee_id === employeeId &&
      shift.dateStr === targetDate &&
      shift.dateStr !== sourceDate // Não considerar a própria alocação
    );
  };

  // Calcula datas válidas para drop (sem colisão)
  const calculateValidDropDates = (shift: ScaleShift): Set<string> => {
    const validDates = new Set<string>();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const formatDateStr = (y: number, m: number, d: number) => {
      const mm = String(m + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      return `${y}-${mm}-${dd}`;
    };

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateStr(year, month, day);
      if (!hasCollision(shift.employee_id, dateStr, shift.dateStr)) {
        validDates.add(dateStr);
      }
    }

    return validDates;
  };

  // Handler para iniciar drag
  const handleDragStart = (e: React.DragEvent, shift: ScaleShift) => {
    e.stopPropagation();
    setDraggedShift(shift);
    setDragError(null);
    const validDates = calculateValidDropDates(shift);
    setValidDropDates(validDates);
  };

  // Handler para drag over (permite drop)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handler para drop em dia
  const handleDropOnDay = async (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedShift) return;

    const moveParams = {
      scaleId: scaleIds[draggedShift.scaleType],
      scaleType: draggedShift.scaleType,
      employeeId: draggedShift.employee_id,
      oldDate: draggedShift.dateStr,
      newDate: targetDate,
      force: false
    };

    try {
      const result = await moveShiftDragDrop(moveParams);

      // CASO A: Backend pede confirmação
      if (!result.success && result.requireConfirmation) {
        setDragConflictModal({
          isOpen: true,
          message: `Conflito detectado:\n${result.error}\n\nDeseja forçar a realocação?`,
          pendingMove: { ...moveParams, force: true }
        });
        setDraggedShift(null);
        setValidDropDates(new Set());
        return;
      }

      // CASO B: Erro real (sem possibilidade de forçar)
      if (!result.success) {
        setDragError(result.error || 'Erro ao mover shift');
        setDraggedShift(null);
        setValidDropDates(new Set());
        return;
      }

      // CASO C: Sucesso
      const updatedShifts = shifts.map(shift =>
        shift.id === draggedShift.id || (shift.employee_id === draggedShift.employee_id && shift.dateStr === draggedShift.dateStr)
          ? { ...shift, dateStr: targetDate }
          : shift
      );

      setShifts(updatedShifts);
      setDraggedShift(null);
      setValidDropDates(new Set());
      setDragError(null);

      await fetchScale();
    } catch (error) {
      console.error('Erro ao salvar shift:', error);
      setDragError('Erro ao salvar mudança. Tente novamente.');
      setDraggedShift(null);
      setValidDropDates(new Set());
    }
  };
  // Handler para forçar movimento após confirmação
  const handleForceMove = async () => {
    if (!dragConflictModal.pendingMove) return;

    try {
      const result = await moveShiftDragDrop(dragConflictModal.pendingMove);

      if (result.success) {
        await fetchScale();
        setDragConflictModal({ isOpen: false, message: '', pendingMove: null });
      } else {
        alert('Erro ao forçar mudança: ' + result.error);
      }
    } catch (error) {
      alert('Erro inesperado ao forçar mudança.');
    }
  };

  // Handler para sair do drag
  const handleDragLeave = () => {
    // Opcional: você pode adicionar lógica aqui
  };

  // Handler para finalizar drag sem drop
  const handleDragEnd = () => {
    setDraggedShift(null);
    setValidDropDates(new Set());
  };

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

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({
        dateStr: formatDateStr(year, month, day),
        day,
        isCurrentMonth: true
      });
    }

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

    const elements = cells.map((cell, idx) => {
      const todayStr = formatDateStr(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()
      );

      const isToday = cell.dateStr === todayStr;
      const isValidDropTarget = validDropDates.has(cell.dateStr);
      const dailyShifts = shifts.filter(s => s.dateStr === cell.dateStr);
      const holidayInfo = isHoliday(cell.dateStr);

      return (
        <div
          key={idx}
          className={`day-cell ${!cell.isCurrentMonth ? 'inactive' : ''} ${isToday ? 'today' : ''} ${isValidDropTarget && draggedShift ? 'valid-drop-target' : ''} ${holidayInfo.isHoliday && cell.isCurrentMonth ? 'holiday' : ''}`}
          onClick={() => handleDayClick(cell.dateStr)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDropOnDay(e, cell.dateStr)}
          onDragLeave={handleDragLeave}
          title={holidayInfo.isHoliday ? holidayInfo.name : ''}
        >
          <div className="day-number">
            {cell.day}
          </div>
          <div className="day-events">
            {dailyShifts.map((shift, i) => {
              const backgroundColor = shift.scaleType === 'ETA' ? '#FFE599' : '#6FA8DC';
              const textColor = shift.scaleType === 'ETA' ? '#000' : '#fff';
              const isDragging = draggedShift?.id === shift.id ||
                (draggedShift?.employee_id === shift.employee_id &&
                  draggedShift?.dateStr === shift.dateStr);

              return (
                <div
                  key={i}
                  className={`event-block ${shift.scaleType === 'ETA' ? 'yellow' : 'blue'} ${isDragging ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, shift)}
                  onDragEnd={handleDragEnd}
                  style={{ color: textColor, cursor: 'grab' }}
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

  const monthDiff = differenceInCalendarMonths(new Date(), currentDate);
  const ableToCreate = monthDiff <= 0 && monthDiff >= -1;

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
          <DownloadScaleButton
            scaleDate={currentDate}
            shifts={shifts}
            disabled={!scaleIds.ETA || !scaleIds.PLANTAO_TARDE || !ableToCreate}
          />

          <button
            className="btn-action primary"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!!scaleIds.ETA || !!scaleIds.PLANTAO_TARDE || !ableToCreate}
          >
            CRIAR ESCALA
          </button>
        </div>
      </div>

      {/* Mensagem de erro de colisão */}
      {dragError && (
        <div className="drag-error-message">
          ⚠️ {dragError}
        </div>
      )}

      <div className="calendar-grid-container">
        <div className="weekdays-header">
          {weekDays.map(day => <div key={day} className="weekday">{day}</div>)}
        </div>
        <div className="days-grid">{renderCalendarDays()}</div>
      </div>

      <CreateScaleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateScale}
        month={currentDate.getMonth() + 1}
        year={currentDate.getFullYear()}
      />

      <EditManualModal
        isOpen={editModal.isOpen}
        date={editModal.date}
        scaleIds={scaleIds}
        onClose={() => setEditModal({ isOpen: false, date: null })}
        onComplete={() => setRefreshKey(old => old + 1)}
      />

      <ConfirmationModal
        isOpen={dragConflictModal.isOpen}
        onClose={() => setDragConflictModal({ isOpen: false, message: '', pendingMove: null })}
        onConfirm={handleForceMove}
        title="Restrição de Escala"
        message={dragConflictModal.message}
        confirmText="FORÇAR MUDANÇA"
        cancelText="CANCELAR"
      />
    </div>
  );
};

export default Scales;