<?php
// Inclui a conexão já existente
require_once '../../../global/config/ocorrenciasConn.php'; // ajusta o caminho conforme necessário

// Caminho do arquivo JSON
$arquivo = 'ocorrenciasDados.json';
$dados = json_decode(file_get_contents($arquivo), true);

if (!$dados) {
    die("JSON inválido ou vazio!");
}

// Loop pelos registros
foreach ($dados as $o) {
    // Converte datas dd-mm-yyyy → yyyy-mm-dd
    $detetado = implode('-', array_reverse(explode('-', $o['detetado'])));
    $comunicado = implode('-', array_reverse(explode('-', $o['comunicado'])));
    $concluido = implode('-', array_reverse(explode('-', $o['concluido'])));

    // Preparar statement
    $stmt = $ocorrenciasConn->prepare("INSERT INTO ocorrencias 
        (oc_local, oc_reporte, oc_detetado, oc_comunicado, oc_concluido, oc_estado, oc_ejr, oc_coordenadas)
        VALUES (:local, :executar, :detetado, :comunicado, :concluido, :estado, :ejr, :coordenadas)");

    if (!$stmt) {
        echo "Erro ao preparar statement: " . $ocorrenciasConn->errorInfo()[2] . "\n";
        continue;
    }

    // Vincula os parâmetros usando bindParam ou bindValue
    $stmt->bindValue(':local', $o['local']);
    $stmt->bindValue(':executar', $o['executar']);
    $stmt->bindValue(':detetado', $detetado);
    $stmt->bindValue(':comunicado', $comunicado);
    $stmt->bindValue(':concluido', $concluido);
    $stmt->bindValue(':estado', $o['estado']);
    $stmt->bindValue(':ejr', $o['ejr']);
    $stmt->bindValue(':coordenadas', $o['coordenadas']);

    // Executa o statement
    if ($stmt->execute()) {
        echo "Registro inserido: {$o['local']}\n";
    } else {
        echo "Erro ao inserir {$o['local']}: " . implode(' ', $stmt->errorInfo()) . "\n";
    }
}

// Finaliza a conexão
echo "Importação concluída!\n";
$ocorrenciasConn = null;
?>
