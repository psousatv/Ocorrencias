/******************************************************************
 * CONFIGURAÇÕES GERAIS
 ******************************************************************/
const API_URL = "dados/ocorrenciasDashboard.php";

const LIMITES = {
  totalMax: 50,
  valorMax: 100
};

let dados = [];
let gauges = {};

/******************************************************************
 * INICIALIZAÇÃO
 ******************************************************************/
document.addEventListener("DOMContentLoaded", () => {
  carregarDados();
});

/******************************************************************
 * CARREGAR DADOS DO SERVIDOR
 ******************************************************************/
function carregarDados() {
  fetch(API_URL)
    .then(response => {
      if (!response.ok) throw new Error("Erro ao carregar dados");
      return response.json();
    })
    .then(json => {
      dados = json;
      renderizarTudo();
    })
    .catch(err => {
      console.error("Erro:", err);
      dados = [];
      renderizarTudo();
    });
}

/******************************************************************
 * RENDERIZAÇÃO PRINCIPAL (TABELA + GAUGES)
 ******************************************************************/
function renderizarTudo() {
  preencherTabela();
  atualizarGauges();
}

/******************************************************************
 * TABELA
 ******************************************************************/
function preencherTabela() {
  const tbody = document.querySelector("#tabelaDados tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  dados.forEach((d, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.ejr}</td>
      <td>${d.local}</td>
      <td>${d.executar}</td>
      <td>${d.detetado}</td>
      <td>${d.comunicado}</td>
      <td>${d.estado}</td>
      <td>
        <a href="${d.coordenadas}" target="_blank">
          Abrir no Maps
        </a>
      </td>
      <td>
        <i class="bi bi-pencil" style="cursor:pointer"
           onclick="editarLinha(${index})"></i>
        <i class="bi bi-trash text-danger ms-2" style="cursor:pointer"
           onclick="apagarLinha(${index})"></i>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/******************************************************************
 * CRUD LOCAL
 ******************************************************************/
function adicionarLinha(registo) {
  dados.push({
    id: registo.id,
    estado: registo.estado,
    valor: Number(registo.valor)
  });
  renderizarTudo();
}

function editarLinha(index) {
  const atual = dados[index].valor;
  const novoValor = prompt("Novo valor:", atual);
  if (novoValor !== null && !isNaN(novoValor)) {
    dados[index].valor = Number(novoValor);
    renderizarTudo();
  }
}

function apagarLinha(index) {
  if (confirm("Apagar este registo?")) {
    dados.splice(index, 1);
    renderizarTudo();
  }
}

/******************************************************************
 * GAUGES (CHART.JS) ATUALIZADO COM CORES POR DIFERENÇA DE DIAS
 ******************************************************************/
function atualizarGauges() {
  const total = dados.length;

  // Ativos: registros que NÃO estão "Tratado"
  const ativosArray = dados.filter(d => d.estado !== "Tratado");
  const numeroAtivos = ativosArray.length;

  // Calcula média de dias entre detetado e comunicado para ativos
  let mediaDiasAtivos = 0;
  if (numeroAtivos > 0) {
    const somaDias = ativosArray.reduce((soma, d) => {
      const detetado = new Date(d.detetado.split("-").reverse().join("-"));
      const comunicado = new Date(d.comunicado.split("-").reverse().join("-"));
      const diff = (comunicado - detetado) / (1000 * 60 * 60 * 24);
      return soma + diff;
    }, 0);
    mediaDiasAtivos = somaDias / numeroAtivos;
  }

  // Contagem de registros "Tratado"
  const tratadosArray = dados.filter(d => d.estado === "Tratado");
  const numeroTratados = tratadosArray.length;

  // Calcula média de dias entre detetado e comunicado para tratados
  let mediaDiasTratados = 0;
  if (numeroTratados > 0) {
    const somaDias = tratadosArray.reduce((soma, d) => {
      const detetado = new Date(d.detetado.split("-").reverse().join("-"));
      const comunicado = new Date(d.comunicado.split("-").reverse().join("-"));
      const diff = (comunicado - detetado) / (1000 * 60 * 60 * 24);
      return soma + diff;
    }, 0);
    mediaDiasTratados = somaDias / numeroTratados;
  }

  criarOuAtualizarGauge("gaugeTotal", total, LIMITES.totalMax, "Total Registos");
  criarOuAtualizarGauge("gaugeAtivos", numeroAtivos, LIMITES.totalMax, "Ativos", mediaDiasAtivos);
  criarOuAtualizarGauge("gaugeValores", numeroTratados, LIMITES.totalMax, "Tratados", mediaDiasTratados);
}

/******************************************************************
 * CRIA / ATUALIZA GAUGE COM COR DINÂMICA POR DIAS
 ******************************************************************/
function criarOuAtualizarGauge(canvasId, valor, max, titulo, mediaDias = 0) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // cor baseada na média de dias
  const cor = corPorDias(mediaDias);
  const restante = Math.max(max - valor, 0);

  if (!gauges[canvasId]) {
    gauges[canvasId] = new Chart(canvas, {
      type: "doughnut",
      data: {
        datasets: [{
          data: [valor, restante],
          backgroundColor: [cor, "#e9ecef"],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        rotation: -90,
        circumference: 180,
        cutout: "70%",
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          title: {
            display: true,
            text: `${titulo}: ${valor}`,
            font: { size: 14 }
          }
        }
      }
    });
  } else {
    const gauge = gauges[canvasId];
    gauge.data.datasets[0].data = [valor, restante];
    gauge.data.datasets[0].backgroundColor[0] = cor;
    gauge.options.plugins.title.text = `${titulo}: ${valor}`;
    gauge.update();
  }
}

/******************************************************************
 * COR DINÂMICA BASEADA EM DIFERENÇA DE DIAS
 ******************************************************************/
function corPorDias(dias) {
  if (dias <= 3) return "#198754";       // verde
  if (dias <= 6) return "#ffc107";       // amarelo
  return "#dc3545";                      // vermelho
}
