function login() {
  if (document.getElementById("senha").value === "1234") {
    document.getElementById("login").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    carregarDados();
  } else {
    alert("Senha incorreta");
  }
}

async function carregarDados() {
  const status = await fetch("data/status.csv").then(r => r.text());
  const hist = await fetch("data/historico.csv").then(r => r.text());
  preencherCards(status);
  gerarGrafico(hist);
}

function preencherCards(csv) {
  const linhas = csv.trim().split("\n").slice(1);
  linhas.forEach(l => {
    const [id, horas, status] = l.split(",");
    document.getElementById(`${id}-h`).textContent = horas;
    document.getElementById(`${id}-s`).textContent = status;
  });
}

function gerarGrafico(csv) {
  const linhas = csv.trim().split("\n");
  const colunas = linhas[0].split(",");
  const labels = [];
  const datasets = colunas.slice(1).map(a => ({ label: a, data: [] }));

  for (let i = 1; i < linhas.length; i++) {
    const c = linhas[i].split(",");
    labels.push(c[0]);
    for (let j = 1; j < c.length; j++) {
      datasets[j - 1].data.push(Number(c[j]));
    }
  }

  new Chart(document.getElementById("grafico"), {
    type: "line",
    data: { labels, datasets }
  });
}
