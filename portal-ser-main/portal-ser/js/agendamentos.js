/*
  Camada de dados dos agendamentos.
  Hoje usa dados de exemplo. Quando integrar o Firebase, troque só o
  conteúdo de cada função (veja os TODO). A tela (remarcar.js) não muda.
*/
const Agendamentos = (() => {
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

  const EXEMPLO = {
    id: "1",
    estudante: "Matheus Silva",
    turma: "2° Meio Ambiente",
    data: "2026-10-27",   // AAAA-MM-DD
    horario: "10:30",
    status: "Agendado",
  };

  // Devolve o agendamento que será remarcado
  async function buscarAgendamento(id) {
    await esperar(400);
    // TODO Firebase: const snap = await getDoc(doc(db, "agendamentos", id));
    //                return { id: snap.id, ...snap.data() };
    return { ...EXEMPLO, id };
  }

  // Devolve um Set com os números dos dias livres do mês (mes: 0 a 11)
  async function buscarDiasDisponiveis(ano, mes) {
    await esperar(250);
    // TODO Firebase: consultar a coleção "disponibilidade" do mês
    const dias = new Set();
    const total = new Date(ano, mes + 1, 0).getDate();
    for (let d = 1; d <= total; d++) {
      const diaSemana = new Date(ano, mes, d).getDay();
      const fimDeSemana = diaSemana === 0 || diaSemana === 6;
      if (!fimDeSemana && d % 5 !== 0) dias.add(d);
    }
    return dias;
  }

  // Devolve a lista de horários livres de uma data ("AAAA-MM-DD")
  async function buscarHorariosLivres(dataISO) {
    await esperar(250);
    // TODO Firebase: consultar os horários da data e remover os já ocupados
    const todos = ["07:30", "08:10", "09:00", "09:50", "10:40", "13:30", "14:20", "15:10"];
    const dia = Number(dataISO.slice(-2));
    return todos.filter((_, i) => (i + dia) % 3 !== 0).slice(0, 6);
  }

  // Salva a nova data e horário
  async function remarcarAgendamento(id, dataISO, horario) {
    await esperar(800);
    // TODO Firebase: await updateDoc(doc(db, "agendamentos", id),
    //                  { data: dataISO, horario, status: "Agendado" });
    console.log("Remarcado:", { id, dataISO, horario });
    return { ok: true };
  }

  return { buscarAgendamento, buscarDiasDisponiveis, buscarHorariosLivres, remarcarAgendamento };
})();