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
  }
];

console.log('📅 Todos os agendamentos:');
appointments.forEach(apt => {
  console.log(`- ${apt.date} (${apt.status}) - ${apt.service}`);
});

console.log('\n📅 Data de hoje:', new Date().toISOString());
console.log('📅 Data de hoje (local):', new Date().toLocaleDateString());

// Teste do filtro para próximos agendamentos
const proximosAgendamentos = appointments.filter(appointment => {
  const appointmentDate = new Date(appointment.date);
  const today = new Date();
  
  // Comparar apenas a data (ignorar horário)
  const appointmentDateOnly = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  return appointmentDateOnly >= todayOnly;
});

console.log('\n🔮 Próximos agendamentos (futuros):');
proximosAgendamentos.forEach(apt => {
  console.log(`- ${apt.date} (${apt.status}) - ${apt.service}`);
});

// Teste do filtro para histórico
const historico = appointments.filter(appointment => {
  const appointmentDate = new Date(appointment.date);
  const today = new Date();
  
  // Comparar apenas a data (ignorar horário)
  const appointmentDateOnly = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  return appointmentDateOnly < todayOnly;
});

console.log('\n📚 Histórico (passados):');
historico.forEach(apt => {
  console.log(`- ${apt.date} (${apt.status}) - ${apt.service}`);
});

console.log('\n📊 Resumo:');
console.log(`Total: ${appointments.length}`);
console.log(`Próximos: ${proximosAgendamentos.length}`);
console.log(`Histórico: ${historico.length}`);
