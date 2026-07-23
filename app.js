/************************************************
 * CONTROL DE ENVÍOS
 * APP.JS
 * VERSIÓN 3.3
 ************************************************/

"use strict";

let scanner = null;
let escaneando = false;
let enviando = false;
let ultimaGuia = "";

document.addEventListener("DOMContentLoaded", iniciarApp);

function iniciarApp() {

    console.log(CONFIG.APP_NAME);
    console.log("Versión:", CONFIG.VERSION);

    const boton = document.getElementById("btnEscanear");

    if (!boton) {
        console.error("No existe el botón btnEscanear");
        return;
    }

    boton.addEventListener("click", toggleScanner);

}

async function toggleScanner() {

    console.log("CLICK");

    if (escaneando) {
        await detenerScanner();
    } else {
        await iniciarScanner();
    }

}

async function iniciarScanner() {

    try {

        mostrarMensaje("Abriendo cámara...", "ok");

        scanner = new Html5Qrcode("reader");

        await scanner.start(
            {
                facingMode: "environment"
            },
            {
                fps: 10,
                qrbox: {
                    width: 280,
                    height: 180
                }
            },
            codigoDetectado,
            errorEscaneo
        );

        escaneando = true;

        document.getElementById("btnEscanear").textContent =
            "Detener Escáner";

        mostrarMensaje("Escáner listo.", "ok");

    } catch (error) {

        console.error(error);

        mostrarMensaje("No fue posible abrir la cámara.", "error");

    }

}

async function detenerScanner() {

    try {

        if (scanner) {

            await scanner.stop();
            await scanner.clear();

        }

    } catch (error) {

        console.error(error);

    }

    scanner = null;
    escaneando = false;

    document.getElementById("reader").innerHTML = "";

    document.getElementById("btnEscanear").textContent =
        "Iniciar Escáner";

    mostrarMensaje("Escáner detenido.", "ok");

}

async function codigoDetectado(texto) {

    if (enviando) return;

    if (texto === ultimaGuia) return;

    ultimaGuia = texto;
    enviando = true;

    mostrarMensaje("Registrando guía...", "ok");

    try {

        const parametros = new URLSearchParams();

        parametros.append("guia", texto);
        parametros.append(
            "usuario",
            document.getElementById("usuario").value
        );

        const respuesta = await fetch(CONFIG.API_URL, {
            method: "POST",
            body: parametros
        });

        console.log("========== RESPUESTA DEL SERVIDOR ==========");
        console.log("Status:", respuesta.status);
        console.log("Status Text:", respuesta.statusText);
        console.log("OK:", respuesta.ok);

        if (!respuesta.ok) {
            throw new Error("Error HTTP: " + respuesta.status);
        }

        const datos = await respuesta.json();

        console.log("Contenido recibido:");
        console.log(datos);
        console.log("============================================");

        mostrarMensaje(
            datos.mensaje,
            datos.ok ? "ok" : "error"
        );

    } catch (error) {

        console.error("========== ERROR ==========");
        console.error(error);
        console.error("Mensaje:", error.message);
        console.error("===========================");

        mostrarMensaje("ERROR: " + error.message, "error");

    }

    setTimeout(() => {

        enviando = false;
        ultimaGuia = "";

    }, 1000);

}

function errorEscaneo(error) {

    // Ignorar errores normales del escáner

}

function mostrarMensaje(texto, tipo = "ok") {

    const mensaje = document.getElementById("mensaje");

    if (!mensaje) return;

    mensaje.style.display = "block";
    mensaje.className = tipo;
    mensaje.textContent = texto;

}
