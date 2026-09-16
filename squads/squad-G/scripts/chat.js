document.addEventListener("DOMContentLoaded", function () {

    const chatToggle = document.querySelector(".chat-toggle");
    const chatWindow = document.querySelector(".chat-window");
    const chatClose = document.querySelector(".chat-close");
    const chatInput = document.querySelector(".chat-input");
    const chatSend = document.querySelector(".chat-send");
    const chatMessages = document.querySelector(".chat-messages");

    if (
        !chatToggle ||
        !chatWindow ||
        !chatClose ||
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
    // ABRIR CHAT
    // =========================================================

    chatToggle.addEventListener("click", function () {
        chatWindow.classList.add("active");

        chatToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        chatInput.focus();
    });


    // =========================================================
    // FECHAR CHAT
    // =========================================================

    chatClose.addEventListener("click", function () {
        chatWindow.classList.remove("active");

        chatToggle.setAttribute(
            "aria-expanded",
            "false"
        );
    });


    // =========================================================
    // ADICIONAR MENSAGEM
    // =========================================================

    function adicionarMensagem(texto, tipo) {

        const mensagem = document.createElement("div");

        mensagem.classList.add(
            "chat-message",
            tipo
        );


        // Mensagens do assistente podem conter Markdown
        // usando **texto** para representar negrito.

        if (tipo === "bot") {

            const textoSeguro = texto
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(
                    /\*\*(.*?)\*\*/g,
                    "<strong>$1</strong>"
                );

            mensagem.innerHTML = textoSeguro;

        } else {

            // Mensagem do usuário é inserida como texto puro.

            mensagem.textContent = texto;
        }


        chatMessages.appendChild(mensagem);

        chatMessages.scrollTop =
            chatMessages.scrollHeight;
    }


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

        chatMessages.appendChild(mensagem);

        chatMessages.scrollTop =
            chatMessages.scrollHeight;

        return mensagem;
    }


    // =========================================================
    // REMOVER "DIGITANDO..."
    // =========================================================

    function removerDigitando(mensagem) {

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

            const response = await fetch(
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


    console.log(
        "G-Data Assistant conectado ao backend Gemini!"
    );

});