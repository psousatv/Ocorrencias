<?php

//Variaveis conexão ao servidor
$myHost = "mdb1";
//$myHost = "mdb1";
$user = "tv";
$password = "taviraverde";
//Bases de Dados
$myDatabase = "anomalias";
//$pgDatabase = "anomalias";

//PDO - Connection to MySQL
$anomaliasConn = new PDO("mysql:host=$myHost;dbname=$myDatabase", $user, $password);

if($anomaliasConn === false) {
    echo "Ocorreu um erro com a conexão";
    exit();
}