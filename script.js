// ================= CONFIGURAÇÕES =================
const SENHA_FIXA = "manutencao123";

// CSVs publicados do Google Sheets
const CSV_HISTORICO = "URL_DO_CSV_HISTORICO_AQUI";
const CSV_STATUS = "URL_DO_CSV_STATUS_AQUI";

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

  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
  }
}

// ================= GRÁFICO =================
function gerarGrafico(textoCSV) {
  const linhas = textoCSV.trim().split("\n");
  const separador = linhas[0].includes(";") ? ";" : ",";

  const cabecalho = linhas[0].split(separador).map(h => h.trim());
  const dados = linhas.slice(1);

  const labels = dados.map(l => l.split(separador)[0]);

  const datasets = [];

  for (let i = 1; i < cabecalho.length; i++) {
    const valores = dados.map(l => {
      const v = l.split(separador)[i];
      if (!v) return null;
      return parseFloat(v.replace(",", "."));
    });

    if (valores.some(v => v !== null && !isNaN(v))) {
      datasets.push({
        label: cabecalho[i],
        data: valores,
        tension: 0.3
      });
    }
  }

  const canvas = document.getElementById("graficoHoras");
  const ctx = canvas.getContext("2d");

  if (window.grafico) {
    window.grafico.destroy();
  }

  window.grafico = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

// ================= CARDS =================
function atualizarCards(textoCSV) {
  const linhas = textoCSV.trim().split("\n");
  const separador = linhas[0].includes(";") ? ";" : ",";

  const dados = linhas.slice(1);

  dados.forEach(linha => {
    const col = linha.split(separador);

    const id = col[0];
    const horasAtuais = parseFloat(col[2].replace(",", "."));
    const proximaManut = parseFloat(col[3].replace(",", "."));
    const status = col[4];

    const restantes = proximaManut - horasAtuais;

    document.getElementById(`horas-${id}`).innerText =
      isNaN(restantes) ? "--" : restantes.toFixed(1) + " h";

    document.getElementById(`status-${id}`).innerText = status;
  });
}
