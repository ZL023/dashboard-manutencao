// ================= CONFIGURAÇÕES =================
const SENHA_FIXA = "manutencao123";

const CSV_HISTORICO =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vTaUiXIXNFnZGpKFFXY3Agul8ZhqwFZsp6zeR_tzEI3iPDWc4gqMpJA2AmBSQXsSaaNiAyDQbxl54Gt/pub?gid=746527009&single=true&output=csv";

const CSV_STATUS =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vTaUiXIXNFnZGpKFFXY3Agul8ZhqwFZsp6zeR_tzEI3iPDWc4gqMpJA2AmBSQXsSaaNiAyDQbxl54Gt/pub?gid=0&single=true&output=csv";
// =================================================


// ================= LOGIN =================
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
    const r1 = await fetch(CSV_HISTORICO);
    const r2 = await fetch(CSV_STATUS);

    const historico = await r1.text();
    const status = await r2.text();

    gerarGrafico(historico);
    atualizarCards(status);

  } catch (e) {
    console.error("Erro ao carregar CSV:", e);
  }
}


// ================= GRÁFICO =================
function gerarGrafico(csv) {
  const linhas = csv.trim().split("\n");
  const sep = linhas[0].includes(";") ? ";" : ",";

  const labels = [];
  const datasets = [];

  const cab = linhas[0].split(sep);
  const aeronaves = cab.slice(1);

  aeronaves.forEach(a => {
    datasets.push({
      label: a,
      data: [],
      tension: 0.3
    });
  });

  linhas.slice(1).forEach(l => {
    const c = l.split(sep);
    labels.push(c[0]);
    for (let i = 1; i < c.length; i++) {
      datasets[i - 1].data.push(parseFloat(c[i]));
    }
  });

  const ctx = document.getElementById("graficoHoras").getContext("2d");

  if (window.grafico) window.grafico.destroy();

  window.grafico = new Chart(ctx, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } }
    }
  });
}


// ================= CARDS =================
function atualizarCards(csv) {
  const linhas = csv.trim().split("\n");
  const sep = linhas[0].includes(";") ? ";" : ",";

  linhas.slice(1).forEach(l => {
    const c = l.split(sep);

    const id = c[0].replace(/[^A-Za-z0-9]/g, "");
    const atual = parseFloat(c[1]);
    const proxima = parseFloat(c[2]);
    const status = c[3];

    const horasEl = document.getElementById(`horas-${id}`);
    const statusEl = document.getElementById(`status-${id}`);

    if (!horasEl || !statusEl) return;

    horasEl.innerText =
      isNaN(atual) || isNaN(proxima)
        ? "--"
        : (proxima - atual).toFixed(1) + " h";

    statusEl.innerText = status;
  });
}
