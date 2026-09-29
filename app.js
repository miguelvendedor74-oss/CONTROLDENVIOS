<!DOCTYPE html>
<html lang="es">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Control de Envíos</title>

    <link rel="stylesheet" href="style.css">

    <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>

</head>

<body>

    <div class="container">

        <h1>📦 Control de Envíos</h1>

        <!-- USUARIO -->

        <label for="usuario">
            Usuario
        </label>

        <select id="usuario">

            <option value="Miguel">
                Miguel
            </option>

            <option value="Usuario 2">
                Usuario 2
            </option>

            <option value="Usuario 3">
                Usuario 3
            </option>

        </select>


        <!-- PAQUETERÍA -->

        <label for="paqueteria">
            Paquetería
        </label>

        <select id="paqueteria">

            <option value="DHL">
                DHL
            </option>

            <option value="ESTAFETA">
                Estafeta
            </option>

        </select>


        <!-- BOTÓN ESCÁNER -->

        <button id="btnEscanear">
            Iniciar Escáner
        </button>


        <!-- LECTOR -->

        <div id="reader"></div>


        <!-- MENSAJES -->

        <div id="mensaje"></div>

    </div>


    <!-- CONFIGURACIÓN -->

    <script src="config.js"></script>


    <!-- APLICACIÓN -->

    <script src="app.js"></script>

</body>

</html>
