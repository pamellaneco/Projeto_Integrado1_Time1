export function generateSobreavisoEmailHtml(employeeName, scaleType, date) {
  const scaleLabel = scaleType === 'ETA' ? 'Plantão da ETA' : 'Plantão da Tarde';
  const dateFormatted = new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notificação de Sobreaviso</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #2A3E4B; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Notificação de Sobreaviso</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Olá, <strong>${employeeName}</strong>,</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Você foi designado para ficar de <strong>sobreaviso</strong> no <strong>${scaleLabel}</strong>.
    </p>
    
    <div style="background-color: #D1E7DD; border-left: 4px solid #0F5132; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 16px; color: #0F5132;">
        <strong>Data:</strong> ${dateFormatted}
      </p>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Por favor, mantenha-se disponível para atender chamados durante o período de sobreaviso.
    </p>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
      Em caso de dúvidas, entre em contato com a coordenação.<br>
      <strong>SAAE - Sistema de Gerenciamento de Escalas</strong>
    </p>
  </div>
</body>
</html>
  `;
}
