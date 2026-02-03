
// Funções para abrir e fechar modal
function abrirModal() {
    document.getElementById("modalOcorrencia").style.display = "block";
  }
  
  function fecharModal() {
    document.getElementById("modalOcorrencia").style.display = "none";
    document.getElementById("formOcorrencia").reset();
  }
  
  // Função para verificar e inserir a ocorrência
  function inserirOcorrencia() {
    const campos = ["local", "executar", "detetado", "comunicado", "concluido", "estado", "ejr", "coordenadas"];
    let faltando = [];
  
    let novaOcorrencia = {};
    campos.forEach(campo => {
      const valor = document.getElementById(campo).value.trim();
      novaOcorrencia[campo] = valor;
      // Para os campos obrigatórios (todos exceto estado e ejr e coordenadas), verificar preenchimento
      if (["local", "executar", "detetado", "comunicado", "concluido"].includes(campo) && !valor) {
        faltando.push(campo);
      }
    });
  
    if (faltando.length > 0) {
      alert("Faltam preencher os campos: " + faltando.join(", "));
      return;
    }
  
    // Acrescenta ao array global dados
    dados.push(novaOcorrencia);
  
    // Re-renderiza a tabela e gauges
    renderizarTudo();
  
    // Fecha o modal e limpa o formulário
    fecharModal();
  
    alert("Ocorrência inserida com sucesso!");
  }
  