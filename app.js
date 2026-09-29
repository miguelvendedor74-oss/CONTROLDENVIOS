/************************************************
 * CONTROL DE ENVÍOS
 * APP.JS
 * VERSIÓN 4.0
 ************************************************/

"use strict";


/************************************************
 * VARIABLES
 ************************************************/

let scanner = null;

let escaneando = false;

let enviando = false;

let ultimaGuia = "";

let ultimaLectura = "";

let lecturasConsecutivas = 0;


/************************************************
 * CONFIGURACIÓN DE CONFIRMACIÓN
 ************************************************/

const LECTURAS_NECESARIAS = 3;


/************************************************
 * CONFIGURACIÓN DE PAQUETERÍAS
 ************************************************/

const CONFIG_SCANNER = {

    DHL: {

        formato: Html5QrcodeSupportedFormats.CODE_128,

        qrbox: {
            width: 360,
            height: 100
        }

    },

    ESTAFETA: {

        formato: Html5QrcodeSupportedFormats.PDF_417,

        qrbox: {
            width: 360,
            height: 150
        }

    }

};


/************************************************
 * INICIO DE LA APLICACIÓN
 ************************************************/

document.addEventListener(
    "DOMContentLoaded",
    iniciarApp
);


/************************************************
 * INICIAR APP
 ************************************************/

function iniciarApp() {

    console.log("================================");

    console.log(CONFIG.APP_NAME);

    console.log(
        "Versión:",
        CONFIG.VERSION
    );

    console.log(
        "Scanner dinámico activo"
    );

    console.log("================================");


    const boton =
        document.getElementById(
            "btnEscanear"
        );


    if (!boton) {

        console.error(
            "No existe el botón btnEscanear"
        );

        return;

    }


    boton.addEventListener(
        "click",
        toggleScanner
    );

}


/************************************************
 * BOTÓN ESCÁNER
 ************************************************/

async function toggleScanner() {

    console.log("CLICK");


    if (escaneando) {

        await detenerScanner();

    } else {

        await iniciarScanner();

    }

}


/************************************************
 * INICIAR ESCÁNER
 ************************************************/

async function iniciarScanner() {

    try {

        const paqueteria =
            document.getElementById(
                "paqueteria"
            ).value;


        const configuracion =
            CONFIG_SCANNER[paqueteria];


        if (!configuracion) {

            mostrarMensaje(
                "Paquetería no configurada.",
                "error"
            );

            return;

        }


        console.log(
            "Paquetería seleccionada:",
            paqueteria
        );


        console.log(
            "Formato:",
            configuracion.formato
        );


        mostrarMensaje(
            "Abriendo cámara...",
            "ok"
        );


        scanner = new Html5Qrcode(
            "reader",
            {
                formatsToSupport: [
                    configuracion.formato
                ]
            }
        );


        await scanner.start(

            {
                facingMode: "environment"
            },

            {

                fps: 8,

                qrbox:
                    configuracion.qrbox

            },

            codigoDetectado,

            errorEscaneo

        );


        escaneando = true;


        document
            .getElementById(
                "btnEscanear"
            )
            .textContent =
            "Detener Escáner";


        mostrarMensaje(

            "Escáner " +
            paqueteria +
            " listo.",

            "ok"

        );


    } catch (error) {

        console.error(
            "ERROR AL INICIAR ESCÁNER:"
        );

        console.error(error);


        scanner = null;

        escaneando = false;


        mostrarMensaje(
            "No fue posible abrir la cámara.",
            "error"
        );

    }

}


/************************************************
 * DETENER ESCÁNER
 ************************************************/

async function detenerScanner() {

    try {

        if (scanner) {

            await scanner.stop();

            await scanner.clear();

        }

    } catch (error) {

        console.error(
            "Error al detener escáner:",
            error
        );

    }


    scanner = null;

    escaneando = false;


    document.getElementById(
        "reader"
    ).innerHTML = "";


    document.getElementById(
        "btnEscanear"
    ).textContent =
        "Iniciar Escáner";


    ultimaLectura = "";

    lecturasConsecutivas = 0;


    mostrarMensaje(
        "Escáner detenido.",
        "ok"
    );

}


/************************************************
 * CÓDIGO DETECTADO
 ************************************************/

async function codigoDetectado(texto) {

    if (enviando) {

        return;

    }


    texto = texto.trim();


    if (texto === "") {

        return;

    }


    /********************************************
     * COMPROBAR LECTURAS REPETIDAS
     ********************************************/

    if (texto === ultimaLectura) {

        lecturasConsecutivas++;

    } else {

        ultimaLectura = texto;

        lecturasConsecutivas = 1;

    }


    console.log(
        "Lectura:",
        texto,
        "| Confirmaciones:",
        lecturasConsecutivas
    );


    /********************************************
     * ESPERAR CONFIRMACIÓN
     ********************************************/

    if (
        lecturasConsecutivas <
        LECTURAS_NECESARIAS
    ) {

        mostrarMensaje(

            "Confirmando lectura " +
            lecturasConsecutivas +
            "/" +
            LECTURAS_NECESARIAS,

            "info"

        );

        return;

    }


    /********************************************
     * EVITAR DUPLICADO LOCAL
     ********************************************/

    if (texto === ultimaGuia) {

        return;

    }


    ultimaGuia = texto;

    enviando = true;


    mostrarMensaje(
        "Registrando guía...",
        "ok"
    );


    /********************************************
     * ENVIAR AL SERVIDOR
     ********************************************/

    try {

        const parametros =
            new URLSearchParams();


        parametros.append(
            "guia",
            texto
        );


        parametros.append(
            "usuario",
            document.getElementById(
                "usuario"
            ).value
        );


        const respuesta =
            await fetch(
                CONFIG.API_URL,
                {

                    method: "POST",

                    body: parametros

                }
            );


        console.log(
            "========== RESPUESTA =========="
        );


        console.log(
            "Status:",
            respuesta.status
        );


        console.log(
            "OK:",
            respuesta.ok
        );


        if (!respuesta.ok) {

            throw new Error(
                "Error HTTP: " +
                respuesta.status
            );

        }


        const datos =
            await respuesta.json();


        console.log(
            "Respuesta:",
            datos
        );


        /****************************************
         * MOSTRAR RESULTADO
         ****************************************/

        mostrarMensaje(

            datos.mensaje,

            datos.ok
                ? "ok"
                : "error"

        );


    } catch (error) {

        console.error(
            "========== ERROR =========="
        );

        console.error(error);


        mostrarMensaje(

            "ERROR: " +
            error.message,

            "error"

        );

    }


    /********************************************
     * REINICIAR CONFIRMACIÓN
     ********************************************/

    setTimeout(() => {

        enviando = false;

        ultimaGuia = "";

        ultimaLectura = "";

        lecturasConsecutivas = 0;

    }, 1200);

}


/************************************************
 * ERRORES NORMALES DEL ESCÁNER
 ************************************************/

function errorEscaneo(error) {

    // Los errores normales de búsqueda
    // se ignoran intencionalmente.

}


/************************************************
 * MOSTRAR MENSAJES
 ************************************************/

function mostrarMensaje(
    texto,
    tipo = "ok"
) {

    const mensaje =
        document.getElementById(
            "mensaje"
        );


    if (!mensaje) {

        return;

    }


    mensaje.style.display =
        "block";


    mensaje.className =
        tipo;


    mensaje.textContent =
        texto;

}
