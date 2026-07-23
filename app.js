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

// NUEVAS VARIABLES
let ultimaLectura = "";
let lecturasConsecutivas = 0;

// Número de veces que debe leerse igual
const LECTURAS_NECESARIAS = 3;

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
    width: 260,
    height: 90
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

    // Si ya estamos enviando una guía, ignorar nuevas lecturas
    if (enviando) return;

    texto = texto.trim();

    // ¿Es la misma lectura que la anterior?
    if (texto === ultimaLectura) {

        lecturasConsecutivas++;

    } else {

        // Es una lectura distinta, reiniciar contador
        ultimaLectura = texto;
        lecturasConsecutivas = 1;

    }

    console.log(
        "Lectura:",
        texto,
        "| Confirmaciones:",
        lecturasConsecutivas
    );

    // Esperar hasta tener varias lecturas iguales
    if (lecturasConsecutivas < LECTURAS_NECESARIAS) {
        return;
    }

    // Evitar registrar dos veces la misma guía
    if (texto === ultimaGuia) {
        return;
    }

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

        if (!respuesta.ok) {
            throw new Error("Error HTTP: " + respuesta.status);
        }

        const datos = await respuesta.json();

        console.log(datos);

        mostrarMensaje(
            datos.mensaje,
            datos.ok ? "ok" : "error"
        );

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "ERROR: " + error.message,
            "error"
        );

    }

    // Reiniciar variables
    setTimeout(() => {

        enviando = false;
        ultimaGuia = "";

        ultimaLectura = "";
        lecturasConsecutivas = 0;

    }, 1000);

}

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
