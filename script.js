// ===== CONFIGURAÇÕES =====
const SENHA_CORRETA = "manutencao123";

// Links CSV do Google Sheets
const URL_AERONAVES = "https://docs.google.com/spreadsheets/d/1lCi9kySBYTIT51zTud04TjedX-mfK9FrXfVD9ch4GUY/gviz/tq?tqx=out:csv&sheet=Aeronaves";
const URL_HISTORICO = "https://docs.google.com/spreadsheets/d/1lCi9kySBYTIT51zTud04TjedX-mfK9FrXfVD9ch4GUY/gviz/tq?tqx=out:csv&sheet=Historico_Horas";

// =========================

function login() {
  const senha = document.getElementById("senha").value;
  if (senha === SENHA_CORRETA) {
    sessionStorage.setItem("logado", "true");
    document.getElementById("login").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    carregarDados();
  } else {
    document.getElementById("erro").innerText = "Senha incorreta";
  }
}

if (sessionStorage.getItem("logado")) {
  document.getElementById("login").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  carregarDados();
}

function csvParaArray(texto) {
  const linhas = texto.trim().split("\n");
  const cabecalho = linhas.shift().split(",");
  return linhas.map(l =>
    Object.fromEntries(
      l.split(",").map((v, i) => [cabecalho[i], v])
    )
  );
}

async function carregarDados() {
  const aero = await fetch(URL_AERONAVES).then(r => r.text());
  const hist = await fetch(URL_HISTORICO).then(r => r.text());

  const aeronaves = csvParaArray(aero);
  const historico = hist.trim().split("\n").map(l => l.split(","));

  gerarCards(aeronaves);
  gerarGrafico(historico);
}

function gerarCards(aeronaves) {
  const container = document.getElementById("cards");
  container.innerHTML = "";

  aeronaves.forEach(a => {
    const h = parseFloat(a["Horas Totais"]);

    const r50 = (parseFloat(a["Ultima_50h"]) + 50) - h;
    const r100 = (parseFloat(a["Ultima_100h"]) + 100) - h;
    const r200 = (parseFloat(a["Ultima_200h"]) + 200) - h;

    let status = "OPERANTE", cor = "verde";
    if (r50 < 0 || r100 < 0 || r200 < 0) {
      status = "INOPERANTE";
      cor = "vermelho";
    } else if (r50 <= 10 || r100 <= 10 || r200 <= 10) {
      status = "ATENÇÃO";
      cor = "amarelo";
    }

    const card = document.createElement("div");
    card.className = `card ${cor}`;
    card.innerHTML = `
      <h3>✈️ ${a["Matrícula"]}</h3>
      <p class="status">${status}</p>
      <p>50h: ${r50.toFixed(1)} h</p>
      <p>100h: ${r100.toFixed(1)} h</p>
      <p>200h: ${r200.toFixed(1)} h</p>
    `;
    container.appendChild(card);
  });
}

function gerarGrafico(dados) {
  const labels = dados.slice(1).map(l => l[0]);
  const aeronaves = dados[0].slice(1);

  const datasets = aeronaves.map((nome, i) => ({
    label: nome,
    data: dados.slice(1).map(l => parseFloat(l[i + 1])),
    tension: 0.3
  }));

  new Chart(document.getElementById("graficoHoras"), {
    type: "line",
    data: { labels, datasets }
  });
}
