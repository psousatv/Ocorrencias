<?php
include "../../../global/config/anomaliasConn.php";

try {
    // Defina a consulta SQL
    $qryAnomalias = "SELECT
        an_check,
        an_local AS 'local',
        an_reporte AS reporte,
        an_ejr AS ejr,
        an_detetado AS detetado,
        an_comunicado AS comunicado,
        an_concluido AS concluido,
        an_estado AS estado,
        an_coordenadas AS coordenadas
        FROM anomalias
        ORDER BY an_estado";

    // Prepare a consulta
    $stmt = $anomaliasConn->prepare($qryAnomalias);
    
    // Se falhar ao preparar o statement
    if (!$stmt) {
        throw new Exception("Erro ao preparar a consulta: " . implode(":", $anomaliasConn->errorInfo()));
    }

    // Execute a consulta
    $stmt->execute();

    // Verifique se a execução foi bem-sucedida
    if ($stmt->errorCode() != '00000') {
        throw new Exception("Erro ao executar a consulta: " . implode(":", $stmt->errorInfo()));
    }

    // Obtenha os dados como um array associativo
    $dadosAnomalias = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Verifique se os dados foram retornados
    if (!$dadosAnomalias) {
        throw new Exception("Nenhum dado encontrado na consulta.");
    }

    // Defina o cabeçalho para JSON e envie a resposta
    header('Content-Type: application/json');
    echo json_encode($dadosAnomalias);

} catch (Exception $e) {
    // Em caso de erro, capture a exceção e exiba a mensagem
    header('Content-Type: application/json');
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ]);
}
?>
