<?php
header('Content-Type: application/json');
include "../../../global/config/ocorrenciasConn.php";

try {
    // Recebe a requisição POST
    $data = json_decode(file_get_contents("php://input"), true);

    // Verifica se os dados estão completos
    if (empty($data['local']) || empty($data['executar']) || empty($data['detetado']) || empty($data['comunicado']) || empty($data['concluido'])) {
        echo json_encode(['erro' => 'Faltam dados obrigatórios']);
        exit;
    }

    // Prepara a query de inserção
    $query = "INSERT INTO ocorrencias (oc_local, oc_reporte, oc_detetado, oc_comunicado, oc_concluido, oc_estado, oc_ejr, oc_coordenadas) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    // Prepara a declaração
    $stmt = $ocorrenciasConn->prepare($query);

    // Vincula os parâmetros
    $stmt->bindParam(1, $data['local']);
    $stmt->bindParam(2, $data['executar']);
    $stmt->bindParam(3, $data['detetado']);
    $stmt->bindParam(4, $data['comunicado']);
    $stmt->bindParam(5, $data['concluido']);
    $stmt->bindParam(6, $data['estado']);
    $stmt->bindParam(7, $data['ejr']);
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
