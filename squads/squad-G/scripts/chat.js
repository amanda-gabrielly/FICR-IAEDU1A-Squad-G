document.addEventListener("DOMContentLoaded", function () {

    const chatToggle = document.querySelector(".chat-toggle");
    const chatWindow = document.querySelector(".chat-window");
    const chatClose = document.querySelector(".chat-close");
    const chatHeader = document.querySelector(".chat-header");
    const chatInput = document.querySelector(".chat-input");
    const chatSend = document.querySelector(".chat-send");
    const chatMessages = document.querySelector(".chat-messages");

    const STORAGE_KEY = "squadGChatHistorico";


    if (
        !chatToggle ||
        !chatWindow ||
        !chatClose ||
        !chatHeader ||
        !chatInput ||
        !chatSend ||
        !chatMessages
    ) {
        console.error(
            "Erro: elementos do G-Data Assistant não foram encontrados."
        );

        return;
    }


    // =========================================================
    // HISTÓRICO DA CONVERSA
    // =========================================================

    let historico = [];


    // =========================================================
    // ESCAPAR HTML
    // =========================================================

    function escaparHTML(texto) {

        return texto
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }


    // =========================================================
    // FORMATAR RESPOSTA DO BOT
    // =========================================================

    function formatarRespostaBot(texto) {

        const textoSeguro =
            escaparHTML(texto);

        return textoSeguro.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );
    }


    // =========================================================
    // SALVAR HISTÓRICO
    // =========================================================

    function salvarHistorico() {

        try {

            sessionStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(historico)
            );

        } catch (error) {

            console.error(
                "Não foi possível salvar o histórico do chat:",
                error
            );
        }
    }


    // =========================================================
    // CARREGAR HISTÓRICO
    // =========================================================

    function carregarHistorico() {

        try {

            const historicoSalvo =
                sessionStorage.getItem(STORAGE_KEY);


            if (!historicoSalvo) {
                return;
            }


            historico =
                JSON.parse(historicoSalvo);


            if (!Array.isArray(historico)) {

                historico = [];

                return;
            }


            historico.forEach(function (mensagem) {

                adicionarMensagemNaTela(
                    mensagem.texto,
                    mensagem.tipo
                );

            });

        } catch (error) {

            console.error(
                "Não foi possível carregar o histórico do chat:",
                error
            );

            historico = [];
        }
    }


    // =========================================================
    // ADICIONAR MENSAGEM NA TELA
    // =========================================================

    function adicionarMensagemNaTela(
        texto,
        tipo
    ) {

        const mensagem =
            document.createElement("div");


        mensagem.classList.add(
            "chat-message",
            tipo
        );


        if (tipo === "bot") {

            mensagem.innerHTML =
                formatarRespostaBot(texto);

        } else {

            mensagem.textContent =
                texto;
        }


        chatMessages.appendChild(
            mensagem
        );


        chatMessages.scrollTop =
            chatMessages.scrollHeight;
    }


    // =========================================================
    // ADICIONAR MENSAGEM
    // =========================================================

    function adicionarMensagem(
        texto,
        tipo,
        salvar = true
    ) {

        adicionarMensagemNaTela(
            texto,
            tipo
        );


        if (salvar) {

            historico.push({
                texto: texto,
                tipo: tipo
            });


            salvarHistorico();
        }
    }


    // =========================================================
    // MENSAGEM INICIAL
    // =========================================================

    function verificarMensagemInicial() {

        if (historico.length === 0) {

            const mensagemInicial =
                "Olá! 👋 Sou o G-Data Assistant. Como posso ajudar?";


            historico.push({
                texto: mensagemInicial,
                tipo: "bot"
            });


            salvarHistorico();
        }
    }


    // =========================================================
    // ABRIR CHAT
    // =========================================================

    function abrirChat() {

        chatWindow.classList.add(
            "active"
        );


        chatToggle.setAttribute(
            "aria-expanded",
            "true"
        );


        chatInput.focus();


        chatMessages.scrollTop =
            chatMessages.scrollHeight;
    }


    // =========================================================
    // MINIMIZAR CHAT
    // =========================================================

    function minimizarChat() {

        chatWindow.classList.remove(
            "active"
        );


        chatToggle.setAttribute(
            "aria-expanded",
            "false"
        );


        chatInput.blur();
    }


    // =========================================================
    // ALTERNAR CHAT
    // =========================================================

    function alternarChat() {

        if (
            chatWindow.classList.contains(
                "active"
            )
        ) {

            minimizarChat();

        } else {

            abrirChat();
        }
    }


    // =========================================================
    // BOTÃO ✦ POSSO AJUDAR?
    // =========================================================

    chatToggle.addEventListener(
        "click",
        function () {

            abrirChat();

        }
    );


    // =========================================================
    // BOTÃO X
    // =========================================================

    chatClose.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            minimizarChat();

        }
    );


    // =========================================================
    // CLICAR NA BARRA DO CHAT
    // =========================================================

    chatHeader.addEventListener(
        "click",
        function () {

            alternarChat();

        }
    );


    // =========================================================
    // EVITAR QUE CLIQUES NOS ELEMENTOS
    // DA BARRA FECHEM O CHAT
    // =========================================================

    chatHeader
        .querySelectorAll("button")
        .forEach(function (botao) {

            botao.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                }
            );

        });


    // =========================================================
    // INDICADOR "DIGITANDO..."
    // =========================================================

    function mostrarDigitando() {

        const mensagem =
            document.createElement("div");


        mensagem.classList.add(
            "chat-message",
            "bot",
            "typing-message"
        );


        mensagem.innerHTML = `
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        `;


        chatMessages.appendChild(
            mensagem
        );


        chatMessages.scrollTop =
            chatMessages.scrollHeight;


        return mensagem;
    }


    // =========================================================
    // REMOVER "DIGITANDO..."
    // =========================================================

    function removerDigitando(
        mensagem
    ) {

        if (mensagem) {

            mensagem.remove();
        }
    }


    // =========================================================
    // ENVIAR MENSAGEM
    // =========================================================

    async function enviarMensagem() {

        const texto =
            chatInput.value.trim();


        // Não envia mensagem vazia.

        if (texto === "") {

            return;
        }


        // Mostra a mensagem do usuário.

        adicionarMensagem(
            texto,
            "user"
        );


        // Limpa o campo.

        chatInput.value = "";


        // Desabilita os controles enquanto aguarda
        // a resposta do Gemini.

        chatInput.disabled = true;

        chatSend.disabled = true;


        // Mostra as três bolinhas.

        const mensagemDigitando =
            mostrarDigitando();


        try {

            const response =
                await fetch(
                    "http://localhost:3000/api/chat",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            mensagem: texto
                        })
                    }
                );


            const data =
                await response.json();


            // Remove as bolinhas.

            removerDigitando(
                mensagemDigitando
            );


            // Verifica se o servidor retornou erro.

            if (!response.ok) {

                throw new Error(
                    data.erro ||
                    "Erro ao consultar o assistente."
                );
            }


            // Mostra a resposta do Gemini.

            adicionarMensagem(
                data.resposta,
                "bot"
            );


        } catch (error) {

            console.error(
                "Erro no G-Data Assistant:",
                error
            );


            removerDigitando(
                mensagemDigitando
            );


            adicionarMensagem(
                "Desculpe, não consegui responder agora. Tente novamente em alguns instantes.",
                "bot"
            );


        } finally {

            // Libera novamente os controles.

            chatInput.disabled = false;

            chatSend.disabled = false;

            chatInput.focus();
        }
    }


    // =========================================================
    // BOTÃO ENVIAR
    // =========================================================

    chatSend.addEventListener(
        "click",
        enviarMensagem
    );


    // =========================================================
    // ENTER PARA ENVIAR
    // =========================================================

    chatInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                enviarMensagem();
            }
        }
    );


    // =========================================================
    // INICIALIZAÇÃO
    // =========================================================

    carregarHistorico();


    verificarMensagemInicial();


    // Se o histórico foi carregado mas a mensagem inicial
    // ainda não estiver na tela, reconstruímos a interface.

    if (
        chatMessages.children.length === 0 &&
        historico.length > 0
    ) {

        historico.forEach(function (mensagem) {

            adicionarMensagemNaTela(
                mensagem.texto,
                mensagem.tipo
            );

        });
    }


    console.log(
        "G-Data Assistant conectado ao backend Gemini!"
    );

});