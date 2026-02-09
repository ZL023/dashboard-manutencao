const URL_STATUS = "STATUS.csv";
const URL_HISTORICO = "HISTORICO.csv";

function verificarSenha() {
  const senha = document.getElementById("senha").value;
  if (senha === "1234") {
    document.getElementById("login").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    carregarDados();
  } else {
    alert("Senha incorreta");
  }
}

async function carregarDados() {
  try {
    const statusCSV = await fetch(URL_STATUS).then(r => r.text());
    preencherCards(statusCSV);

    const histCSV = await fetch(URL_HISTORICO).then(r => r.text());
    gerarGrafico(histCSV);

  } catch (e) {
    console.error("Erro ao carregar CSV:", e);
  }
}

/* ================= CARDS ================= */

function preencherCards(csv) {
  const linhas = csv.trim().split("\n");
  const sep = linhas[0].includes(";") ? ";" : ",";

  linhas.slice(1).forEach(l => {
    const c = l.split(sep);
    if (c.length < 4) return;

    const id = c[0];
    document.getElementById(`horas-${id}`).textContent = c[1];
    document.getElementById(`status-${id}`).textContent = c[2];
  });
}

/* ================= GRÁFICO ================= */

function gerarGrafico(csv) {
  const linhas = csv.trim().split("\n");
  if (linhas.length < 2) return;

  const sep = linhas[0].includes(";") ? ";" : ",";
  const cab = linhas[0].split(sep);

  const aeronaves = cab.slice(1);
  const labels = [];
  const datasets = aeronaves.map(a => ({
    label: a,
    data: [],
    tension: 0.3
  }));

  for (let i = 1; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    if (!linha) continue;

    const c = linha.split(sep);
    labels.push(c[0]);

    for (let j = 0; j < aeronaves.length; j++) {
      const v = c[j + 1];
      const num = v ? parseFloat(v.replace(",", ".")) : null;
      datasets[j].data.push(isNaN(num) ? null : num);
    }
  }

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
