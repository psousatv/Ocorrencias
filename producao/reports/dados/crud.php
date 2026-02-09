<?php
header('Content-Type: application/json');
include "../../../global/config/anomaliasConn.php";

try {
    // Recebe a requisição POST
    $data = json_decode(file_get_contents("php://input"), true);

    $chave_primaria_anomalias = is_array($data) ? count($data) : 0;

    // Verifica se os dados estão completos
    if (
        empty($chave_primaria_anomalias['an_check']) ||
        empty($chave_primaria_anomalias['oc_check']) ||
        empty($data['local']) ||
        empty($data['ejr']) || 
        empty($data['reporte']) || 
        empty($data['detetado']) || 
        empty($data['comunicado']) ||
        empty($data['estrado']) ||
        empty($data['coordenadas'])) {
        echo json_encode(['erro' => 'Faltam dados obrigatórios']);
        exit;
    }

    // Prepara a query de inserção
    $query = "INSERT INTO ocorrencias (
              an_check,
              oc_check,
              oc_local, 
              oc_ejr, 
              oc_reporte, 
              oc_detetado,
              oc_comunicado,
              oc_estado,
              oc_coordenadas) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    // Prepara a declaração
    $stmt = $ocorrenciasConn->prepare($query);

    // Vincula os parâmetros
    $stmt->bindParam(1, $chave_primaria_anomalias['an_check'] + 1);
    $stmt->bindParam(2, $chave_primaria_anomalias['oc_check'] + 1);
    $stmt->bindParam(2, $data['local']);
    $stmt->bindParam(3, $data['ejr']);
    $stmt->bindParam(4, $data['reporte']);
    $stmt->bindParam(5, $data['detetado']);
    $stmt->bindParam(6, $data['comunicado']);
    $stmt->bindParam(7, $data['estado']);
    $stmt->bindParam(8, $data['coordenadas']);

    // Tenta executar e verificar se foi bem-sucedido
    if ($stmt->execute()) {
        echo json_encode(['mensagem' => 'Ocorrência adicionada com sucesso!']);
    } else {
        echo json_encode(['erro' => 'Erro ao adicionar ocorrência']);
    }

} catch (Exception $e) {
    // Em caso de erro, capture a exceção e exiba a mensagem
    echo json_encode([
        'erro' => true,
        'message' => $e->getMessage()
    ]);
}
?>
