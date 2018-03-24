<!Doctype html>
<html>
<head>
    <link rel="shortcut icon" href="/favicon.ico">
    <script type="text/javascript" src="/_design/player/hls.js"></script>
    <script type="text/javascript" src="/_design/player/player.js"></script>

    <link href="/_design/player/player.css" type="text/css" rel="stylesheet">
    <meta http-equiv="content-type" content="text/html; charset=Windows-1251">
    <title>Тест плеера</title>
</head>

<body style="background: url(/fon.png) top left repeat-x">
    <center style="">
        <div id="playera" class="player" onselectstart="return false;" style="box-shadow: 6px 6px 6px 1px rgba(0,0,0,0.36); position: absolute; left:50%; margin-left:-426.5px">
		<?php 
			echo file_get_contents("player.html");
		?>
        </div>
    </center>
</html>
	