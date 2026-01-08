import { ipcMain } from "electron";
import { EmployeeService } from "../preload/services/employee";
import { ScaleService } from "../preload/services/scale";
import { db } from "../database/setup";
import { AuthService } from "../preload/services/auth";

function generateScaleHtml({
  monthLabel,
  plantaoWeeks,
  etaWeeks,
}) {
  const renderTable = (weeks) => `
    <table>
      <thead>
        <tr>
          <th style="width: 20%">SEMANA</th>
          <th style="width: 15%">DIA</th>
          <th style="width: 65%">SERVIDOR</th>
        </tr>
      </thead>
      <tbody>
        ${weeks
      .map(week =>
        week.days.map((day, dayIndex) => `
              <tr>
                ${dayIndex === 0 ? `<td class="week" rowspan="${week.days.length}">${week.weekNumber}ª</td>` : ''}
                <td>${String(day.day).padStart(2, "0")}</td>
                <td class="employee">${day.employee || "-"}</td>
              </tr>
            `).join('')
      )
      .join("")}
      </tbody>
    </table>
  `;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }

    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      color: #000;
    }

    h1 {
      text-align: center;
      font-size: 20px;
      margin: 0 0 8px 0;
      font-weight: bold;
    }

    h2 {
      text-align: center;
      font-size: 18px;
      margin: 0 0 24px 0;
      font-weight: bold;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      margin-bottom: 24px;
    }

    th {
      background-color: #214658;
      color: white;
      border: 1px solid #000;
      padding: 6px;
      text-align: center;
      font-weight: bold;
    }

    td {
      border: 1px solid #000;
      padding: 6px;
      text-align: center;
      vertical-align: middle;
      word-wrap: break-word;
      white-space: normal;
      line-height: 1.5;
    }

    td.week {
      background-color: #B2B19D;
      font-weight: bold;
    }
    
    td.employee {
      text-align: left;
      padding-left: 12px;
    }

    .page-break {
      page-break-before: always;
    }
  </style>
</head>

<body>

  <h1>Escala de Revezamento de Encanadores</h1>
  <h2>PLANTÃO DA TARDE — ${monthLabel}</h2>

  ${renderTable(plantaoWeeks)}

  <div class="page-break"></div>

  <h1>Escala da Estação de Tratamento de Água</h1>
  <h2>ETA — ${monthLabel}</h2>

  ${renderTable(etaWeeks)}

</body>
</html>
`;
}

// auth
const auth = new AuthService();

ipcMain.handle('auth-login', async (_event, email, password) => {
  try {
    const token = auth.login(email, password) // lança se inválido
    return { ok: true, token }
  } catch (err) {
    return { ok: false, error: err?.message ?? String(err) }
  }
})

// employee
const employeeService = new EmployeeService(db);

ipcMain.handle('get-all-employees', async (_, params) => {
  return employeeService.getPaginated(params);
});

// Handler para mover shift via drag-drop
ipcMain.handle('move-shift-drag-drop', async (_, params) => {
  try {
    const { scaleId, scaleType, employeeId, oldDate, newDate, force } = params;

    if (!scaleId || !scaleType || !employeeId || !oldDate || !newDate) {
      return { success: false, error: 'Parâmetros inválidos' };
    }

    const violations = [];

    // 1. Validação: Colisão (Já trabalha nesse dia?)
    const hasCollisionOnNewDate = scaleService.checkCollision(
      scaleId,
      employeeId,
      newDate,
      scaleType
    );

    if (hasCollisionOnNewDate) {
      violations.push(`O funcionário já está alocado neste dia (${newDate}).`);
    }

    // 2. Validação: Restrições do Funcionário (Fim de semana / Feriado)
    const restrictionError = scaleService.checkRestrictions(scaleId, employeeId, newDate);
    if (restrictionError) {
      violations.push(restrictionError);
    }

    // 3. Validação: Regra de Descanso ETA (3 dias)
    if (scaleType === 'ETA') {
      const violatesRestRule = scaleService.checkETARestRule(
        scaleId,
        employeeId,
        newDate
      );

      if (violatesRestRule) {
        violations.push('O funcionário não cumpre o descanso mínimo de 3 dias.');
      }
    }

    // 4. Verificação Final e Confirmação
    if (violations.length > 0 && !force) {
      return {
        success: false,
        requireConfirmation: true,
        error: violations.join('\n')
      };
    }

    // 5. Execução (Salvar no banco)
    scaleService.repository.removeShift(scaleId, employeeId, oldDate);
    scaleService.repository.addShift(scaleId, employeeId, newDate);

    return {
      success: true,
      message: 'Shift movido com sucesso'
    };

  } catch (err) {
    console.error('Erro ao mover shift:', err);
    return {
      success: false,
      error: err?.message ?? String(err)
    };
  }
});

ipcMain.handle('find-eligible-employees', async (_, params) => {
  try {
    return employeeService.findEligible(params);
  } catch (err) {
    return { error: err?.message ?? String(err) }
  }
});

ipcMain.handle('create-employee', async (_, payload) => {
  employeeService.create(payload);
});

ipcMain.handle('update-employee', async (_, payload) => {
  employeeService.update(payload);
});

ipcMain.handle('delete-employee', async (_, id) => {
  employeeService.delete(id);
});

//scale
const scaleService = new ScaleService(db);

ipcMain.handle('get-scale', async (_, params) => {
  try {
    return scaleService.getScale(params);
  } catch (err) {
    return { error: err?.message ?? String(err) };
  }
});

ipcMain.handle('create-scale', async (_, params) => {
  try {
    return await scaleService.createScale(params);
  } catch (err) {
    return { error: err?.message ?? String(err) };
  }
});

ipcMain.handle('get-day-modal-data', async (_, params) => {
  try {
    return scaleService.getEmployeesForDayModal(params);
  } catch (err) {
    return { error: err?.message ?? String(err) };
  }
});

ipcMain.handle('update-manual-shifts', async (_, params) => {
  try {
    return scaleService.updateManualShifts(params);
  } catch (err) {
    return { error: err?.message ?? String(err) };
  }
});

ipcMain.handle('publish-scale', async (_, params) => {
  try {
    const { monthName, year, shifts, emailHtml, scaleDate } = params;

    // Generate HTML for PDF
    const { BrowserWindow } = await import('electron');

    // Transform shifts into weeks structure
    const getWeeksInMonth = (monthIndex, yearNum, shifts, scaleType) => {
      const firstDay = new Date(yearNum, monthIndex, 1);
      const lastDay = new Date(yearNum, monthIndex + 1, 0);
      const daysInMonth = lastDay.getDate();

      const weeks = [];
      let currentWeek = [];
      let weekNumber = 1;

      const filteredShifts = shifts.filter(s => s.scaleType === scaleType);

      console.log('Filtered shifts for', scaleType, ':', filteredShifts.length);
      console.log('Sample shift:', filteredShifts[0]);

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(yearNum, monthIndex, day);
        const dayOfWeek = date.getDay();

        const dateStr = `${yearNum}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const shift = filteredShifts.find(s => s.dateStr === dateStr);

        if (day === 1) {
          console.log('Looking for dateStr:', dateStr);
          console.log('Found shift:', shift);
        }

        currentWeek.push({
          day,
          dayOfWeek,
          employee: shift ? shift.employee_name : ''
        });

        if (dayOfWeek === 6 || day === daysInMonth) {
          weeks.push({
            weekNumber,
            days: currentWeek
          });
          currentWeek = [];
          weekNumber++;
        }
      }

      console.log('Total weeks generated:', weeks.length);
      console.log('Sample week:', weeks[0]);

      return weeks;
    };

    // Get month index from scaleDate or first shift
    let monthIndex;
    if (scaleDate) {
      monthIndex = new Date(scaleDate).getMonth();
    } else if (shifts.length > 0) {
      monthIndex = new Date(shifts[0].dateStr).getMonth();
    } else {
      return { error: 'Não foi possível determinar o mês da escala' };
    }

    console.log('Using monthIndex:', monthIndex, 'for year:', year);

    const plantaoWeeks = getWeeksInMonth(monthIndex, year, shifts, 'PLANTAO_TARDE');
    const etaWeeks = getWeeksInMonth(monthIndex, year, shifts, 'ETA');

    const htmlContent = generateScaleHtml({
      monthLabel: `${monthName.toUpperCase()}/${year}`,
      plantaoWeeks,
      etaWeeks
    });

    // Create a hidden window to render HTML and generate PDF
    const win = new BrowserWindow({
      show: false,
      webPreferences: {
        offscreen: true,
      },
    });

    // Load HTML content
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate PDF
    const pdfBuffer = await win.webContents.printToPDF({
      printBackground: true,
      margins: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
    });

    // Close the window
    win.close();

    const attachmentFilename = `escala_${monthName}_${year}.pdf`;

    // Get all active employees
    const employees = employeeService.repository.getAllActive();

    if (!employees || employees.length === 0) {
      return { error: 'Nenhum funcionário ativo encontrado' };
    }

    const { sendEmail } = await import('../preload/external/mailer/index.ts');

    let emailsSent = 0;
    const errors = [];

    // Send email to each employee
    for (const employee of employees) {
      if (!employee.email) {
        errors.push(`${employee.name}: sem e-mail cadastrado`);
        continue;
      }

      if (![
        "acopsenadeveloper@gmail.com",
        // "coutinhogaby25@gmail.com",
        // "paulosergiooliveira113@gmail.com",
        // "pamellakyrlatech@gmail.com",
        // "lialilinbox@gmail.com",
      ].includes(employee.email)) {
        continue;
      }

      try {
        await sendEmail({
          to: employee.email,
          subject: `Escala de Trabalho SAAE - ${monthName}/${year}`,
          html: emailHtml,
          attachments: [
            {
              filename: attachmentFilename,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        });

        emailsSent++;
      } catch (emailError) {
        errors.push(`${employee.name}: ${emailError.message}`);
      }
    }

    return {
      success: true,
      emailsSent,
      totalEmployees: employees.length,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (err) {
    console.error('Erro ao publicar escala:', err);
    return { error: err?.message ?? String(err) };
  }
});

ipcMain.handle('create-sobreaviso', async (_, params) => {
  try {
    return scaleService.createSobreaviso(params);
  } catch (err) {
    return { error: err?.message ?? String(err) };
  }
});

ipcMain.handle('get-sobreavisos-by-date', async (_, date) => {
  try {
    return scaleService.getSobreavisosByDate(date);
  } catch (err) {
    return { error: err?.message ?? String(err) };
  }
});