(() => {
  const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                 "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const id = new URLSearchParams(window.location.search).get("id") || "1";
  const $ = (s) => document.querySelector(s);

  const grade = $("#grade");
  const tituloMes = $("#mes-titulo");
  const listaHorarios = $("#horarios");
  const aviso = $("#aviso-horarios");
  const previa = $("#previa");
  const erro = $("#erro");
  const finalizar = $("#finalizar");

  const estado = { ano: 0, mes: 0, dia: null, horario: null };
  let tokenMes = 0;
  let tokenHorarios = 0;

  const dataISO = (a, m, d) => `${a}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const formatarData = (iso) => iso.split("-").reverse().join("/");
  const formatarHora = (h) => h.replace(":", "h");

  
  async function iniciar() {
    try {
      const ag = await Agendamentos.buscarAgendamento(id);
      for (const [alvo, valor] of [["#estudante", ag.estudante], ["#turma", ag.turma]]) {
        const el = $(alvo);
        el.textContent = valor;
        el.classList.remove("carregando");
      }
      $("#data-atual").textContent = formatarData(ag.data);
      $("#hora-atual").textContent = formatarHora(ag.horario);

      const [a, m] = ag.data.split("-").map(Number);
      estado.ano = a;
      estado.mes = m - 1;
    } catch (e) {
      mostrarErro("Não foi possível carregar o agendamento.");
      const hoje = new Date();
      estado.ano = hoje.getFullYear();
      estado.mes = hoje.getMonth();
    }
    desenharMes(0);
  }

  /* ---------- Calendário ---------- */
  async function desenharMes(direcao) {
    const meu = ++tokenMes;
    tituloMes.textContent = `${MESES[estado.mes]} ${estado.ano}`;
    grade.setAttribute("aria-busy", "true");

    const disponiveis = await Agendamentos.buscarDiasDisponiveis(estado.ano, estado.mes);
    if (meu !== tokenMes) return; // o usuário já trocou de mês de novo

    grade.setAttribute("aria-busy", "false");
    grade.className = "grade " + (direcao > 0 ? "vem-direita" : direcao < 0 ? "vem-esquerda" : "");
    grade.innerHTML = "";

    const vazios = new Date(estado.ano, estado.mes, 1).getDay();
    const total = new Date(estado.ano, estado.mes + 1, 0).getDate();

    for (let i = 0; i < vazios; i++) grade.append(document.createElement("span"));

    for (let d = 1; d <= total; d++) {
      const livre = disponiveis.has(d);
      const iso = dataISO(estado.ano, estado.mes, d);
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = d;
      b.className = "dia " + (livre ? "livre" : "indisponivel");
      b.disabled = !livre;
      b.style.setProperty("--i", d);
      b.setAttribute("aria-label", `${d} de ${MESES[estado.mes]}, ${livre ? "disponível" : "indisponível"}`);

      if (iso === estado.dia) {
        b.classList.add("selecionado");
        b.setAttribute("aria-pressed", "true");
      }
      if (livre) b.addEventListener("click", () => escolherDia(iso, b));
      grade.append(b);
    }
  }

  function mudarMes(delta) {
    estado.mes += delta;
    if (estado.mes < 0) { estado.mes = 11; estado.ano--; }
    if (estado.mes > 11) { estado.mes = 0; estado.ano++; }
    desenharMes(delta);
  }

  /* ---------- Escolha de data e horário ---------- */
  async function escolherDia(iso, botao) {
    grade.querySelectorAll(".selecionado").forEach((x) => {
      x.classList.remove("selecionado");
      x.removeAttribute("aria-pressed");
    });
    botao.classList.add("selecionado");
    botao.setAttribute("aria-pressed", "true");

    estado.dia = iso;
    estado.horario = null;
    esconderErro();
    atualizarPrevia();

    const meu = ++tokenHorarios;
    listaHorarios.innerHTML = "";
    aviso.textContent = "Buscando horários…";
    aviso.hidden = false;

    let livres = [];
    try {
      livres = await Agendamentos.buscarHorariosLivres(iso);
    } catch (e) {
      mostrarErro("Não foi possível buscar os horários.");
    }
    if (meu !== tokenHorarios) return;

    aviso.textContent = "Não há horários livres neste dia. Tente outra data.";
    aviso.hidden = livres.length > 0;

    livres.forEach((h, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "horario";
      b.textContent = h;
      b.style.setProperty("--i", i);
      b.addEventListener("click", () => escolherHorario(h, b));
      listaHorarios.append(b);
    });
  }

  function escolherHorario(h, botao) {
    listaHorarios.querySelectorAll(".selecionado").forEach((x) => {
      x.classList.remove("selecionado");
      x.removeAttribute("aria-pressed");
    });
    botao.classList.add("selecionado");
    botao.setAttribute("aria-pressed", "true");
    estado.horario = h;
    atualizarPrevia();
  }

  function atualizarPrevia() {
    if (!estado.dia) {
      previa.hidden = true;
      finalizar.disabled = true;
      return;
    }
    const data = formatarData(estado.dia);
    $("#previa-texto").textContent = estado.horario
      ? `${data} às ${formatarHora(estado.horario)}`
      : `${data} · escolha um horário`;

    previa.hidden = false;
    previa.classList.remove("nova");
    void previa.offsetWidth; // reinicia a animação
    previa.classList.add("nova");

    finalizar.disabled = !estado.horario;
  }

  /* ---------- Finalizar ---------- */
  finalizar.addEventListener("click", async () => {
    finalizar.disabled = true;
    finalizar.textContent = "Remarcando…";
    esconderErro();

    try {
      await Agendamentos.remarcarAgendamento(id, estado.dia, estado.horario);
      $("#sucesso-detalhe").textContent =
        `Novo horário: ${formatarData(estado.dia)} às ${formatarHora(estado.horario)}.`;
      $("#sucesso").hidden = false;
      $("#sucesso-link").focus();
    } catch (e) {
      mostrarErro("Não foi possível remarcar. Tente novamente.");
      finalizar.disabled = false;
    }
    finalizar.textContent = "Finalizar";
  });

  function mostrarErro(msg) { erro.textContent = msg; erro.hidden = false; }
  function esconderErro() { erro.hidden = true; }

  $("#mes-anterior").addEventListener("click", () => mudarMes(-1));
  $("#mes-proximo").addEventListener("click", () => mudarMes(1));

  iniciar();
})();