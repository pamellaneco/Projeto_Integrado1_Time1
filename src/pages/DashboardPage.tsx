import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import { getScale, createSobreaviso, getSobreavisosByDate } from '../ipc-bridge/scale';
import { getAllEmployees } from '../ipc-bridge/employee';
import FuncionarioModal from '../components/funcionarioModal/FuncionarioModal';
import CreateScaleModal from '../components/createScaleModal/CreateScaleModal';

type TodayShift = {
  employee_name: string;
  employee_id: string;
  scaleType: "ETA" | "PLANTAO_TARDE";
  email?: string;
  status?: string;
  dateStr?: string;
}

const DashboardPage: React.FC = () => {
  const [todayShifts, setTodayShifts] = useState<TodayShift[]>([]);
  const [weekShifts, setWeekShifts] = useState<TodayShift[]>([]);
  const [holidays, setHolidays] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isSobreavisoModalOpen, setIsSobreavisoModalOpen] = useState(false);
  const [preSelectedSobreavisoETA, setPreSelectedSobreavisoETA] = useState<any[]>([]);
  const [preSelectedSobreavisoPlantao, setPreSelectedSobreavisoPlantao] = useState<any[]>([]);
  const [hasSobreaviso, setHasSobreaviso] = useState(false);

  useEffect(() => {
    fetchTodayShifts();
  }, []);

  const fetchTodayShifts = async () => {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayString = `${year}-${month}-${day}`;
      const monthString = `${year}-${month}`;

      console.log('=== DASHBOARD DEBUG ===');
      console.log('Today:', todayString);
      console.log('Month:', monthString);

      const [etaResult, plantaoResult] = await Promise.all([
        getScale({ month: monthString, type: 'ETA' }),
        getScale({ month: monthString, type: 'PLANTAO_TARDE' })
      ]);

      console.log('ETA Result:', etaResult);
      console.log('Plantao Result:', plantaoResult);

      const shifts: TodayShift[] = [];
      const allShifts: TodayShift[] = [];

      // Processar ETA
      if (etaResult?.shifts) {
        console.log('Total ETA shifts:', etaResult.shifts.length);
        console.log('Primeiros 3 shifts ETA:', etaResult.shifts.slice(0, 3));
        
        const etaShifts = etaResult.shifts.filter(
          (shift: any) => {
            console.log(`Comparando: "${shift.dateStr}" === "${todayString}"`);
            return shift.dateStr === todayString;
          }
        );
        console.log('ETA shifts para hoje:', etaShifts);
        
        etaShifts.forEach((shift: any) => {
          shifts.push({
            employee_name: shift.employee_name,
            employee_id: shift.employee_id,
            scaleType: 'ETA',
            email: shift.employee_email,
            status: 'Trabalhando'
          });
        });

        // Adicionar todos os shifts ETA para a semana
        etaResult.shifts.forEach((shift: any) => {
          allShifts.push({
            employee_name: shift.employee_name,
            employee_id: shift.employee_id,
            scaleType: 'ETA',
            email: shift.employee_email,
            status: 'Trabalhando',
            dateStr: shift.dateStr
          } as any);
        });
      }

      // Processar Plantão da Tarde
      if (plantaoResult?.shifts) {
        console.log('Total Plantão shifts:', plantaoResult.shifts.length);
        console.log('Primeiros 3 shifts Plantão:', plantaoResult.shifts.slice(0, 3));
        
        const plantaoShifts = plantaoResult.shifts.filter(
          (shift: any) => shift.dateStr === todayString
        );
        console.log('Plantão shifts para hoje:', plantaoShifts);
        
        plantaoShifts.forEach((shift: any) => {
          shifts.push({
            employee_name: shift.employee_name,
            employee_id: shift.employee_id,
            scaleType: 'PLANTAO_TARDE',
            email: shift.employee_email,
            status: 'Trabalhando'
          });
        });

        // Adicionar todos os shifts Plantão para a semana
        plantaoResult.shifts.forEach((shift: any) => {
          allShifts.push({
            employee_name: shift.employee_name,
            employee_id: shift.employee_id,
            scaleType: 'PLANTAO_TARDE',
            email: shift.employee_email,
            status: 'Trabalhando',
            dateStr: shift.dateStr
          } as any);
        });
      }

      // Processar feriados
      const holidaysMap: { [key: string]: string } = {};
      
      if (etaResult?.holidays && Array.isArray(etaResult.holidays)) {
        etaResult.holidays.forEach((holiday: any) => {
          const dateKey = holiday.date || holiday.holiday_date;
          const name = holiday.name || holiday.holiday_name || 'Feriado';
          if (dateKey) {
            holidaysMap[dateKey] = name;
          }
        });
      }
      
      if (plantaoResult?.holidays && Array.isArray(plantaoResult.holidays)) {
        plantaoResult.holidays.forEach((holiday: any) => {
          const dateKey = holiday.date || holiday.holiday_date;
          const name = holiday.name || holiday.holiday_name || 'Feriado';
          if (dateKey) {
            holidaysMap[dateKey] = name;
          }
        });
      }

      console.log('Total shifts para hoje:', shifts);
      console.log('Total shifts para a semana:', allShifts);
      console.log('Feriados:', holidaysMap);

      // Buscar sobreavisos para hoje
      console.log('Buscando sobreavisos para:', todayString);
      const sobreavisos = await getSobreavisosByDate(todayString);
      console.log('Sobreavisos retornados:', sobreavisos);

      if (sobreavisos && Array.isArray(sobreavisos)) {
        console.log('Adicionando', sobreavisos.length, 'sobreavisos');
        setHasSobreaviso(sobreavisos.length > 0);
        sobreavisos.forEach((sobreaviso: any) => {
          shifts.push({
            employee_name: sobreaviso.employee_name,
            employee_id: sobreaviso.employee_id,
            scaleType: sobreaviso.scale_type,
            email: sobreaviso.employee_email,
            status: 'Sobreaviso'
          });
        });
      }

      console.log('Total de shifts (incluindo sobreavisos):', shifts);
      setTodayShifts(shifts);
      setWeekShifts(allShifts);
      setHolidays(holidaysMap);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar turnos de hoje:', error);
      setLoading(false);
    }
  };

  const getScaleTypeLabel = (type: string) => {
    if (type === 'ETA') return 'Plantão da ETA';
    if (type === 'PLANTAO_TARDE') return 'Plantão da Tarde';
    return type;
  };

  const handleEmployeeClick = async (employeeId: string) => {
    try {
      const response: any = await getAllEmployees({ page: 1, limit: 1000, searchTerm: '' });
      const employee = response.employees.find((emp: any) => emp.id === employeeId);
      if (employee) {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do funcionário:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleSobreavisoClick = async () => {
    try {
      // Buscar sobreavisos do mês atual
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const todayString = `${year}-${month}-${String(today.getDate()).padStart(2, '0')}`;
      
      console.log('Buscando sobreavisos para pré-seleção:', todayString);
      const sobreavisos = await getSobreavisosByDate(todayString);
      console.log('Sobreavisos encontrados:', sobreavisos);
      
      if (sobreavisos && Array.isArray(sobreavisos)) {
        const etaEmployees = sobreavisos
          .filter((s: any) => s.scale_type === 'ETA')
          .map((s: any) => ({
            id: s.employee_id,
            name: s.employee_name,
            email: s.employee_email
          }));
        
        const plantaoEmployees = sobreavisos
          .filter((s: any) => s.scale_type === 'PLANTAO_TARDE')
          .map((s: any) => ({
            id: s.employee_id,
            name: s.employee_name,
            email: s.employee_email
          }));
        
        console.log('ETA pré-selecionados:', etaEmployees);
        console.log('Plantão pré-selecionados:', plantaoEmployees);
        
        setPreSelectedSobreavisoETA(etaEmployees);
        setPreSelectedSobreavisoPlantao(plantaoEmployees);
      } else {
        setPreSelectedSobreavisoETA([]);
        setPreSelectedSobreavisoPlantao([]);
      }
      
      setIsSobreavisoModalOpen(true);
    } catch (error) {
      console.error('Erro ao buscar sobreavisos:', error);
      setPreSelectedSobreavisoETA([]);
      setPreSelectedSobreavisoPlantao([]);
      setIsSobreavisoModalOpen(true);
    }
  };

  const handleSobreavisoSubmit = async (result: any) => {
    console.log('=== CRIANDO SOBREAVISO ===');
    console.log('Payload recebido:', result);
    try {
      const sobreavisoResult = await createSobreaviso(result);
      console.log('Resposta do servidor:', sobreavisoResult);
      
      if (sobreavisoResult?.error) {
        alert(`Erro ao criar sobreaviso: ${sobreavisoResult.error}`);
        return;
      }
      
      // Recarregar dados da tela
      await fetchTodayShifts();
      alert('Sobreavisos criados com sucesso!');
    } catch (error) {
      console.error('Erro ao criar sobreaviso:', error);
      alert(`Erro ao criar sobreaviso: ${error}`);
    }
  };

  // Calcular dias da semana atual
  const getWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = domingo, 6 = sábado
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay); // Volta para domingo

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const formatDateStr = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getShiftsForDay = (dateStr: string) => {
    return weekShifts.filter(shift => shift.dateStr === dateStr);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isHoliday = (dateStr: string) => {
    return holidays[dateStr] !== undefined;
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const currentWeek = getWeekDays();
  const weekStart = currentWeek[0].getDate();
  const weekEnd = currentWeek[6].getDate();

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="today-scale-section">
        <div className="section-header-with-button">
          <h2 className="section-title">Escala de Hoje</h2>
          <button className="btn-sobreaviso" onClick={handleSobreavisoClick}>
            {hasSobreaviso ? 'EDITAR SOBREAVISO' : 'SOBREAVISO'}
          </button>
        </div>
        
        {todayShifts.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum funcionário escalado para hoje.</p>
          </div>
        ) : (
          <table className="today-scale-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Plantão</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {todayShifts.map((shift, index) => (
                <tr 
                  key={index} 
                  className="clickable-row"
                  onClick={() => handleEmployeeClick(shift.employee_id)}
                >
                  <td>{shift.employee_name}</td>
                  <td>
                    <span className="shift-label">
                      <span className={`shift-indicator ${shift.scaleType === 'ETA' ? 'indicator-eta' : 'indicator-tarde'}`}></span>
                      {getScaleTypeLabel(shift.scaleType)}
                    </span>
                  </td>
                  <td>{shift.email || '-'}</td>
                  <td>
                    <span className={`status-indicator ${shift.status === 'Sobreaviso' ? 'sobreaviso' : 'working'}`}>
                      <span className="status-dot"></span>
                      {shift.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Calendário Semanal */}
      <div className="weekly-scale-section">
        <h2 className="section-title">
          Escala Semanal - Dezembro <span className="week-range">{weekStart} - {weekEnd}</span>
        </h2>

        <div className="calendar-grid-container">
          <div className="weekdays-header">
            {weekDays.map((day, index) => (
              <div key={index} className="weekday">{day}</div>
            ))}
          </div>

          <div className="calendar-week-row">
            {currentWeek.map((date, index) => {
              const dateStr = formatDateStr(date);
              const dayShifts = getShiftsForDay(dateStr);
              const isTodayDate = isToday(date);
              const isHolidayDate = isHoliday(dateStr);

              return (
                <div 
                  key={index} 
                  className={`day-cell ${isTodayDate ? 'today' : ''} ${isHolidayDate ? 'holiday' : ''}`}
                >
                  <div className={`day-number ${isTodayDate ? 'today' : ''}`}>
                    {date.getDate()}
                  </div>
                  <div className="shifts-container">
                    {dayShifts.map((shift, idx) => (
                      <div
                        key={idx}
                        className={`shift-card ${shift.scaleType === 'ETA' ? 'eta' : 'plantao'}`}
                        onClick={() => handleEmployeeClick(shift.employee_id)}
                      >
                        {shift.employee_name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      
      <CreateScaleModal
        isOpen={isSobreavisoModalOpen}
        onClose={() => setIsSobreavisoModalOpen(false)}
        onSubmit={handleSobreavisoSubmit}
        month={new Date().getMonth() + 1}
        year={new Date().getFullYear()}
        skipHolidays={true}
        preSelectedETA={preSelectedSobreavisoETA as any}
        preSelectedPlantao={preSelectedSobreavisoPlantao as any}
      />

      {isModalOpen && selectedEmployee && (
        <FuncionarioModal
          isOpen={isModalOpen}
          onClose={closeModal}
          initialMode="view"
          employee={selectedEmployee}
          handleCreate={() => {}}
          handleUpdate={() => {}}
          handleDelete={() => {}}
        />
      )}
    </div>
  );
};

export default DashboardPage;
