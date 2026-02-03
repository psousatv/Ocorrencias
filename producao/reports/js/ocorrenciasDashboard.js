/******************************************************************
 * CONFIGURAÇÕES GERAIS
 ******************************************************************/
const API_URL = "dados/ocorrenciasDashboard.php";

const LIMITES = {
  diasConforme: 30,
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
async function carregarDados() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Erro ao carregar dados: " + response.status);

    let json = await response.json();

    // Ordenar: registros com estado != "Tratado" primeiro
    json.sort((a, b) => {
      if (a.estado !== "Tratado" && b.estado === "Tratado") return -1; // a vem antes
      if (a.estado === "Tratado" && b.estado !== "Tratado") return 1;  // b vem antes
      return 0; // ambos iguais ou ambos != "Tratado"
    });

    dados = json;
    renderizarTudo();
  } catch (err) {
    console.error("Erro:", err);
    dados = [];
    renderizarTudo();
  }
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

    // Calcular diferença de dias entre concluído e comunicado
    let diffDias = 0;
    if (d.detetado) {
      // Converter a data de 'comunicado' para o formato de data
      const comunicado = new Date(d.comunicado.split("-").reverse().join("-"));
      
      // Se 'concluido' estiver vazio, considerar a data de hoje
      const concluido = d.concluido ? 
        new Date(d.concluido.split("-").reverse().join("-")) : new Date();
      
      // Formatar a data de hoje no mesmo formato (yyyy-mm-dd) que comunicado e concluído
      //const hoje = new Date();
      //const hojeFormatada = hoje.toISOString().split('T')[0];  // Formato yyyy-mm-dd

      // Se 'concluido' for vazio, substituir por 'hojeFormatada'
      //const dataFinal = d.concluido ? concluido : hojeFormatada;

      // Calcular a diferença de dias entre 'concluido' e 'comunicado'
      diffDias = (concluido - comunicado) / (1000 * 60 * 60 * 24);     
      
      // Exibir log para depuração (opcional)
      console.log("Data Detetado:", d.detetado);
      console.log("Data Comunicado:", d.comunicado);
      console.log("Data Concluído:", concluido);
      console.log("Diferença de dias:", diffDias);
      console.log("Estado:", d.estado);

     }
     
    // Determinar estilos e título da célula estado
    let estiloEstado = "";
    let tituloEstado = "";

    if (!d.estado || d.estado.trim() === "") {
      // Estado vazio → laranja
      estiloEstado = "background-color: orange; color: white; font-weight: bold;";
      tituloEstado = "Estado vazio";
    } else if (diffDias >= LIMITES.diasConforme) {
      // Dias acima do limite → vermelho
      estiloEstado = "background-color: red; color: white; font-weight: bold;";
      tituloEstado = `Dias passados (${Math.round(diffDias)}) ≥ ${LIMITES.diasConforme}`;
    } else {
      // Dias abaixo do limite → verde
      estiloEstado = "background-color: #198754; color: white; font-weight: bold;";
      tituloEstado = `Dias passados (${Math.round(diffDias)}) < ${LIMITES.diasConforme}`;
    }

    tr.innerHTML = `
      <td>${d.ejr}</td>
      <td>${d.local}</td>
      <td>${d.reporte}</td>
      <td>${d.detetado}</td>
      <td>${d.comunicado}</td>
      <td>${d.concluido}</td>
      <td style="${estiloEstado}" title="${tituloEstado}">${d.estado || "—"}</td>
      <td>
        <a href="${d.coordenadas}" target="_blank">
          Abrir no Maps
        </a>
      </td>
      <td>
        <i class="bi bi-envelope" style="cursor:pointer" title="Enviar Email"
           onclick="enviarEmail(${index})"></i>
        <i class="bi bi-pencil ms-2" style="cursor:pointer" title="Editar"
           onclick="editarLinha(${index})"></i>
        <i class="bi bi-trash text-danger ms-2" style="cursor:pointer" title="Apagar"
           onclick="apagarLinha(${index})"></i>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/******************************************************************
 * CRUD LOCAL
 ******************************************************************/
function adicionarLinha() {
  abrirModal();
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

function enviarEmail (index){
  prompt("Em Tratamento");
};

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
  criarOuAtualizarGauge("gaugeTratados", numeroTratados, LIMITES.totalMax, "Tratados", mediaDiasTratados);
  criarOuAtualizarGauge("gaugeAtivos", numeroAtivos, LIMITES.totalMax, "Em Curso", mediaDiasAtivos);
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


/******************************************************************
 * FUNÇÕES PARA ABRIR E FECHAR O MODAL
 ******************************************************************/
// Funções para abrir e fechar modal
function abrirModal() {
  document.getElementById("formOcorrencia").reset();
  document.getElementById("modalOcorrencia").style.display = "block";
}

function fecharModal() {
  document.getElementById("modalOcorrencia").style.display = "none";
  document.getElementById("formOcorrencia").reset();

}

/******************************************************************
 * VALIDAR DADOS E ADICIONAR AO SERVIDOR
 ******************************************************************/
async function validarEAdicionar() {
  // Campos a recolher do formulário
const campos = ["local", "executar", "detetado", "comunicado", "concluido", "ejr", "coordenadas"];
const obrigatorios = ["local", "executar", "estado", "detetado", "comunicado", "concluido"];

let novaOcorrencia = {};
let faltando = [];

// Recolha + validação
campos.forEach(campo => {
  const el = document.getElementById(campo);
  const valor = el ? el.value.trim() : "";
  novaOcorrencia[campo] = valor;

  if (obrigatorios.includes(campo) && !valor) {
    faltando.push(campo);
  }
});

// ❌ Falhou validação
if (faltando.length > 0) {
  alert("Faltam preencher os campos: " + faltando.join(", "));
  return;
}

console.log("Nova ocorrência:", novaOcorrencia);

// 📡 Envio para o servidor
try {
  // Enviar dados para o servidor via API (PHP)
  const response = await fetch("dados/ocorrenciasCRUD.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(novaOcorrencia)
  });

  const result = await response.json();

  // Se a resposta não for OK, gerar um erro
  if (!response.ok) {
    throw new Error(result.erro || "Erro desconhecido ao adicionar ocorrência");
  }

  // ✅ Se a resposta foi positiva, atualizar dados locais
  dados.push(novaOcorrencia);
  renderizarTudo();

  // Fechar modal
  fecharModal();

  // Alerta de sucesso
  alert(result.mensagem || "Ocorrência adicionada com sucesso!");

} catch (erro) {
  // Caso ocorra um erro ao tentar adicionar
  console.error(erro);
  alert("Erro ao adicionar ocorrência. Tente novamente.");
}
}






