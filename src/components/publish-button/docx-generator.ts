import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  TextRun,
  VerticalAlign,
  AlignmentType,
} from "docx";

type ScaleShift = {
  dateStr: string;
  employee_name: string;
  employee_id: string;
  scaleType: "ETA" | "PLANTAO_TARDE";
  id?: string;
}

type DayShift = {
  day: number;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  employee: string;
};

type WeekData = {
  weekNumber: number;
  days: DayShift[];
};

const getWeeksInMonth = (month: Date, shifts: ScaleShift[], scaleType: "ETA" | "PLANTAO_TARDE"): WeekData[] => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  // Get the first and last day of the month
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const daysInMonth = lastDay.getDate();

  const weeks: WeekData[] = [];
  let currentWeek: DayShift[] = [];
  let weekNumber = 1;

  // Filter shifts by scale type
  const filteredShifts = shifts.filter(s => s.scaleType === scaleType);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthIndex, day);
    const dayOfWeek = date.getDay();

    // Format date to match shift dateStr format (YYYY-MM-DD)
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Find shift for this day and scale type
    const shift = filteredShifts.find(s => s.dateStr === dateStr);

    currentWeek.push({
      day,
      dayOfWeek,
      employee: shift ? shift.employee_name : "",
    });

    // If it's Saturday or the last day of the month, close the week
    if (dayOfWeek === 6 || day === daysInMonth) {
      weeks.push({
        weekNumber,
        days: [...currentWeek],
      });
      currentWeek = [];
      weekNumber++;
    }
  }

  return weeks;
};

const createScaleTable = (weeks: WeekData[], scaleType: "ETA" | "PLANTAO_TARDE") => {
  const tableRows = [
    // Cabeçalho
    new TableRow({
      height: {
        rule: "atLeast",
        value: 300
      },
      children: [
        new TableCell({
          width: { size: 2000, type: WidthType.DXA },
          shading: { fill: "#214658" },
          verticalAlign: "center",
          children: [new Paragraph({ alignment: "center", children: [new TextRun({ text: "SEMANA", bold: true, })] })],
        }),
        new TableCell({
          width: { size: 1500, type: WidthType.DXA },
          shading: { fill: "#214658" },
          verticalAlign: "center",
          children: [new Paragraph({ alignment: "center", children: [new TextRun({ text: "DIA", bold: true })] })],
        }),
        new TableCell({
          width: { size: 5000, type: WidthType.DXA },
          shading: { fill: "#214658" },
          verticalAlign: "center",
          children: [new Paragraph({ alignment: "center", children: [new TextRun({ text: "SERVIDOR", bold: true })] })],
        }),
      ],
    }),
  ];

  // Adiciona as linhas de dados com rowSpan para as semanas
  weeks.forEach((week) => {
    week.days.forEach((dayShift, dayIndex) => {
      const cells: TableCell[] = [];

      // Adiciona a célula da semana apenas na primeira linha de cada semana com rowSpan
      if (dayIndex === 0) {
        cells.push(
          new TableCell({
            rowSpan: week.days.length,
            shading: { fill: "#B2B19D" },
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({
              children: [new TextRun({ text: `${week.weekNumber}ª` })],
              alignment: AlignmentType.CENTER
            })],
          })
        );
      }

      // Adiciona as células de dia e servidor
      cells.push(
        new TableCell({
          children: [new Paragraph({
            text: String(dayShift.day).padStart(2, '0'),
            alignment: "center"
          })],
          verticalAlign: "center"
        })
      );

      cells.push(
        new TableCell({
          children: [new Paragraph(
            {
              text: dayShift.employee || "-",
              alignment: "center"
            })],
          verticalAlign: "center"
        })
      );

      tableRows.push(new TableRow({
        height: {
          rule: "atLeast",
          value: 300
        },
        children: cells
      }));
    });
  });

  return new Table({
    rows: tableRows,
    alignment: "center",
    width: {
      size: 90,
      type: WidthType.PERCENTAGE,
    },
  });
};

export const generateScaleDocx = async (month: Date, shifts: ScaleShift[]) => {
  const etaWeeks = getWeeksInMonth(month, shifts, "ETA");
  const plantaoWeeks = getWeeksInMonth(month, shifts, "PLANTAO_TARDE");

  const etaTable = createScaleTable(etaWeeks, "ETA");
  const plantaoTable = createScaleTable(plantaoWeeks, "PLANTAO_TARDE");

  // Cria o documento
  const monthName = month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial" } } }
    },
    sections: [
      {
        children: [
          new Paragraph({
            alignment: "center",
            children: [
              new TextRun({
                text: "Escala de Revezamento de Encanadores",
                bold: true,
                size: 42,
              }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            alignment: "center",
            children: [
              new TextRun({
                text: `PLANTÃO DA TARDE — ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`,
                bold: true,
                size: 42,
              }),
            ],
            spacing: { after: 300 },
          }),
          etaTable,
          new Paragraph({
            pageBreakBefore: true,
            alignment: "center",
            children: [
              new TextRun({
                text: "Escala da Estação de Tratamento de Água",
                bold: true,
                size: 42,
              }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            alignment: "center",
            children: [
              new TextRun({
                text: `ETA — ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`,
                bold: true,
                size: 42,
              }),
            ],
            spacing: { after: 300 },
          }),
          plantaoTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return { blob };
}
