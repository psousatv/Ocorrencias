<?php
include "../../../global/config/ocorrenciasConn.php";

try {
    // Defina a consulta SQL
    $qryOcorrencias = "SELECT
        oc_check,
        oc_ejr AS ejr,
        oc_estado AS estado,
        oc_local AS 'local',
        oc_reporte AS reporte,
        oc_detetado AS detetado,
        oc_comunicado AS comunicado,
        oc_concluido AS concluido,git status
        oc_coordenadas AS coordenadas
        FROM ocorrencias
        ORDER BY estado";

    // Prepare a consulta
    $stmt = $ocorrenciasConn->prepare($qryOcorrencias);
    
    // Se falhar ao preparar o statement
    if (!$stmt) {
        throw new Exception("Erro ao preparar a consulta: " . implode(":", $ocorrenciasConn->errorInfo()));
    }

    // Execute a consulta
    $stmt->execute();

    // Verifique se a execução foi bem-sucedida
    if ($stmt->errorCode() != '00000') {
        throw new Exception("Erro ao executar a consulta: " . implode(":", $stmt->errorInfo()));
    }

    // Obtenha os dados como um array associativo
    $dadosOcorrencias = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Verifique se os dados foram retornados
    if (!$dadosOcorrencias) {
        throw new Exception("Nenhum dado encontrado na consulta.");
    }

    // Defina o cabeçalho para JSON e envie a resposta
    header('Content-Type: application/json');
    echo json_encode($dadosOcorrencias);

} catch (Exception $e) {
    // Em caso de erro, capture a exceção e exiba a mensagem
    header('Content-Type: application/json');
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ]);
}
?>
