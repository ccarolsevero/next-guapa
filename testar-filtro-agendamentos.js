// Teste do filtro de agendamentos
const appointments = [
  {
    id: "1",
    date: "2025-09-19T00:00:00.000Z",
    status: "SCHEDULED",
    service: "Corte e Tratamento Keune"
  },
  {
    id: "2", 
    date: "2025-09-17T00:00:00.000Z",
    status: "SCHEDULED",
    service: "Reconstrução Capilar"
  },
  {
    id: "3",
    date: "2025-09-06T00:00:00.000Z", 
    status: "CANCELLED",
    service: "Avaliação Capilar"
  },
  {
    id: "4",
    date: "2025-09-04T00:00:00.000Z", 
    status: "COMPLETED",
    service: "Tratamento Capilar"
  },
  {
    id: "5",
    date: "2025-09-03T00:00:00.000Z", 
    status: "NO_SHOW",
    service: "Corte"
  }
];

console.log('📅 Todos os agendamentos:');
appointments.forEach(apt => {
  console.log(`- ${apt.date} (${apt.status}) - ${apt.service}`);
});

console.log('\n📅 Data de hoje:', new Date().toISOString());
console.log('📅 Data de hoje (local):', new Date().toLocaleDateString());

// Teste de conversão de datas UTC para local
console.log('\n🕐 Teste de fuso horário:');
const testDate = "2025-09-17T00:00:00.000Z";
const utcDate = new Date(testDate);
const localDate = new Date(utcDate.getFullYear(), utcDate.getMonth(), utcDate.getDate());

console.log(`Data UTC: ${testDate}`);
console.log(`Data local: ${localDate.toLocaleDateString()}`);
console.log(`UTC getDate(): ${utcDate.getDate()}`);
console.log(`Local getDate(): ${localDate.getDate()}`);
console.log(`UTC getMonth(): ${utcDate.getMonth()}`);
console.log(`Local getMonth(): ${localDate.getMonth()}`);

// Teste do filtro para próximos agendamentos (corrigido para fuso horário)
const proximosAgendamentos = appointments.filter(appointment => {
  // Usar apenas a parte da data (YYYY-MM-DD) para evitar problemas de fuso horário
  const appointmentDateStr = appointment.date.split('T')[0]; // "2025-09-17"
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // "2025-09-05"
  
  return appointmentDateStr >= todayStr;
});

console.log('\n🔮 Próximos agendamentos (futuros):');
proximosAgendamentos.forEach(apt => {
  console.log(`- ${apt.date} (${apt.status}) - ${apt.service}`);
});

// Teste do filtro para histórico (corrigido para fuso horário)
const historico = appointments.filter(appointment => {
  // Usar apenas a parte da data (YYYY-MM-DD) para evitar problemas de fuso horário
  const appointmentDateStr = appointment.date.split('T')[0]; // "2025-09-04"
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // "2025-09-05"
  
  return appointmentDateStr < todayStr;
});

console.log('\n📚 Histórico (passados):');
historico.forEach(apt => {
  console.log(`- ${apt.date} (${apt.status}) - ${apt.service}`);
});

console.log('\n📊 Resumo:');
console.log(`Total: ${appointments.length}`);
console.log(`Próximos: ${proximosAgendamentos.length}`);
console.log(`Histórico: ${historico.length}`);
