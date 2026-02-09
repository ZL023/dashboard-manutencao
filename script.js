// ================= CONFIGURAÇÕES =================
const SENHA_FIXA = "manutencao123";

const CSV_HISTORICO = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTaUiXIXNFnZGpKFFXY3Agul8ZhqwFZsp6zeR_tzEI3iPDWc4gqMpJA2AmBSQXsSaaNiAyDQbxl54Gt/pub?gid=746527009&single=true&output=csv";
const CSV_STATUS    = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTaUiXIXNFnZGpKFFXY3Agul8ZhqwFZsp6zeR_tzEI3iPDWc4gqMpJA2AmBSQXsSaaNiAyDQbxl54Gt/pub?gid=0&single=true&output=csv";
// =================================================

// LOGIN
function verificarSenha() {
  const senha = document.getElementById("senha").value;

  if (senha === SENHA_FIXA) {
    document.getElementById("login").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    carregarDados();
  } else {
    alert("Senha incorreta");
  }
}

// ================= CARREGAMENTO =================
async function carregarDados() {
  try {
    const hist = await fetch(CSV_HISTORICO).then(r => r.text());
    const status = await fetch(CSV_STATUS).then(r => r.text());

    gerarGrafico(hist);
    atualizarCards(status);

  } catch (e) {
    console.error("Erro ao carregar dados:", e);
  }
}

// ================= GRÁFICO =================
function gerarGrafico(csv) {
  const linhas = csv.trim().split("\n");
  const sep = linhas[0].includes(";") ? ";" : ",";

  const dados = linhas.slice(1);
  const labels = dados.map(l => l.split(sep)[0]);

  const cabecalho = linhas[0].split(sep).slice(1);
  const datasets = [];

  cabecalho.forEach((nome, idx) => {
    const valores = dados.map(l => {
      const v = l.split(sep)[idx + 1];
      if (!v) return null;
      return parseFloat(v.replace(",", "."));
    });

    if (valores.some(v => v !== null && !isNaN(v))) {
      datasets.push({
        label: nome.trim(),
        data: valores,
        tension: 0.3
      });
    }
  });

  const ctx = document.getElementById("graficoHoras").getContext("2d");

  if (window.grafico) window.grafico.destroy();

  window.grafico = new Chart(ctx, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

// ================= CARDS =================
function atualizarCards(csv) {
  const linhas = csv.trim().split("\n");
  const sep = linhas[0].includes(";") ? ";" : ",";

  linhas.slice(1).forEach(linha => {
    if (!linha.trim()) return; // ignora linha vazia

    const c = linha.split(sep);
    if (!c[0]) return; // ignora ID vazio

    const id = c[0].replace(/[^A-Za-z0-9]/g, "");

    const horasAtuais = parseFloat((c[2] || "").replace(",", "."));
    const proxima = parseFloat((c[3] || "").replace(",", "."));
    const status = c[4] || "--";

    const horasEl = document.getElementById(`horas-${id}`);
    const statusEl = document.getElementById(`status-${id}`);

    if (!horasEl || !statusEl) {
      console.warn(`Card não encontrado para aeronave: ${id}`);
      return;
    }

    if (isNaN(horasAtuais) || isNaN(proxima)) {
      horasEl.innerText = "--";
    } else {
      horasEl.innerText = (proxima - horasAtuais).toFixed(1) + " h";
    }

    statusEl.innerText = status;
  });
}




