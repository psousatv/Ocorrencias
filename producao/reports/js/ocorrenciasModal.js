
/******************************************************************
 * FUNÇÕES PARA ABRIR E FECHAR O MODAL
 ******************************************************************/

async function abrirModal() {
  // Evita carregar o modal mais de uma vez
  if (document.getElementById("modalAnomalia")) {
    document.getElementById("modalAnomalia").style.display = "block";
    document.getElementById("formAnomaliaAdd").reset();
    return;
  }

  try {
    const response = await fetch("ocorrenciasModal.html");
    const html = await response.text();

    document.getElementById("modalContainer").innerHTML = html;

    document.getElementById("formAnomaliaAdd").reset();
    document.getElementById("modalAnomalia").style.display = "block";
  } catch (error) {
    console.error("Erro ao carregar o modal:", error);
  }
}

function fecharModal() {
  const modal = document.getElementById("modalAnomalia");

  if (modal) {
    modal.style.display = "none";
    document.getElementById("formAnomaliaAdd").reset();
  }
}

  // Função para verificar e inserir a ocorrência
  function inserirOcorrencia() {
    const campos = ["local", "reporte", "ejr", "detetado", "coordenadas"];
    let faltando = [];
  
    let novaOcorrencia = {};
    campos.forEach(campo => {
      const valor = document.getElementById(campo).value.trim();
      novaOcorrencia[campo] = valor;
      // Para os campos obrigatórios (todos exceto estado e ejr e coordenadas), verificar preenchimento
      if (["local", "reporte", "ejr", "detetado", "coordenadas"].includes(campo) && !valor) {
        faltando.push(campo);
      }
    });
  
    if (faltando.length > 0) {
      alert("Faltam preencher os campos: " + faltando.join(", "));
      return;
    }
  
    // Acrescenta ao array global dados
    dados.push(novaOcorrencia);
  
    // Acrescenta ao servidor
    validarEAdicionar();
    
    // Re-renderiza a tabela e gauges
    renderizarTudo();
  
    // Fecha o modal e limpa o formulário
    fecharModal();
  
    alert("Ocorrência inserida com sucesso!");
  }
  

/******************************************************************
 * VALIDAR DADOS E ADICIONAR AO SERVIDOR
 ******************************************************************/
async function validarEAdicionar() {
  // Campos a recolher do formulário
const campos = ["local", "reporte", "ejr", "detetado", "coordenadas"];
const obrigatorios = ["local", "reporte", "ejr", "detetado", "coordenadas"];

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

// Falhou validação
if (faltando.length > 0) {
  alert("Faltam preencher os campos: " + faltando.join(", "));
  return;
}

console.log("Nova ocorrência:", novaOcorrencia);

// 📡 Envio para o servidor
try {
  // Enviar dados para o servidor via API (PHP)
  const response = await fetch("dados/crud.php", {
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