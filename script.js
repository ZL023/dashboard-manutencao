// ================= CONFIGURAÇÕES =================
const SENHA_FIXA = "manutencao123";

const CSV_HISTORICO = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTaUiXIXNFnZGpKFFXY3Agul8ZhqwFZsp6zeR_tzEI3iPDWc4gqMpJA2AmBSQXsSaaNiAyDQbxl54Gt/pub?gid=746527009&single=true&output=csv";
const CSV_STATUS    = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTaUiXIXNFnZGpKFFXY3Agul8ZhqwFZsp6zeR_tzEI3iPDWc4gqMpJA2AmBSQXsSaaNiAyDQbxl54Gt/pubhtml?gid=0&single=true";
// =================================================


// ================= LOGIN =================
function verificarSenha() {
  const senhaInput = document.getElementById("senha");
  if (!senhaInput) return;

  if (senhaInput.value === SENHA_FIXA) {
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
    const histResp = await fetch(CSV_HISTORICO);
    const statResp = await fetch(CSV_STATUS);

    const hist = await histResp.text();
    const status = await statResp.text();

    gerarGrafico(hist);
    atualizarCards(status);

  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
  }
}


// ================= GRÁFICO =================
function gerarGrafico(csv) {
  if (!csv) return;

  const linhas = csv.trim().split("\n");
  if (linhas.length < 2) return;

  const sep = linhas[0].includes(";") ? ";" : ",";

  const dados = linhas.slice(1).filter(l => l.trim());
  const labels = dados.map(l => l.split(sep)[0]);

  const cabecalho = linhas[0].split(sep).slice(1);
  const datasets = [];

  cabecalho.forEach((nome, idx) => {
    const valores = dados.map(l => {
      const v = (l.split(sep)[idx + 1] || "").replace(",", ".");
      const n = parseFloat(v);
      return isNaN(n) ? null : n;
    });

    if (valores.some(v => v !== null)) {
      datasets.push({
        label: nome.trim(),
        data: valores,
        tension: 0.3
      });
    }
  });

  const canvas = document.getElementById("graficoHoras");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

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
  if (!csv) return;

  const linhas = csv.trim().split("\n");
  if (linhas.length < 2) return;

  const sep = linhas[0].includes(";") ? ";" : ",";

  linhas.slice(1).forEach(linha => {
    if (!linha || !linha.trim()) return;

    const c = linha.split(sep);
    if (!c[0]) return;

    const id = c[0].replace(/[^A-Za-z0-9]/g, "");
    if (!id) return;

    const horasEl  = document.getElementById(`horas-${id}`);
    const statusEl = document.getElementById(`status-${id}`);

    if (!horasEl || !statusEl) {
      console.warn(`Card não encontrado para aeronave: ${id}`);
      return;
    }

    const horasAtuais = parseFloat((c[2] || "").replace(",", "."));
    const proxima     = parseFloat((c[3] || "").replace(",", "."));
    const status      = c[4] || "--";

    if (isNaN(horasAtuais) || isNaN(proxima)) {
      horasEl.innerText = "--";
    } else {
      horasEl.innerText = (proxima - horasAtuais).toFixed(1) + " h";
    }

    statusEl.innerText = status;
  });
}


