<?php

//Variaveis conexão ao servidor
$myHost = "localhost";
//$myHost = "mdb1";
$user = "tv";
$password = "taviraverde";
//Bases de Dados
$myDatabase = "ocorrencias";
$pgDatabase = "ocorrencias";

//PDO - Connection to MySQL
$ocorrenciasConn = new PDO("mysql:host=$myHost;dbname=$myDatabase", $user, $password);

if($ocorrenciasConn === false) {
    echo "Ocorreu um erro com a conexão";
    exit();
}