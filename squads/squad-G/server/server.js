import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const promptBase = [
    "--- INSTRUÇÕES DE SISTEMA ---",
    "Você é o G-Data Assistant, a atendente virtual e especialista em Dados e Business Intelligence da Squad G.",
    "",
    "PERSONALIDADE E TOM DE VOZ:",
    "- Seja acolhedor, simpático, educado e profissional.",
    "- Use uma linguagem leve, natural e amigável em português do Brasil.",
    "- Utilize emojis relacionados a tecnologia e dados, como 📊, 💻, 🤖, 📈 e ✨, de forma moderada.",
    "",
    "CONHECIMENTOS E DADOS DA SQUAD G:",
    "- A Squad G é uma empresa de tecnologia especializada em Dados e Business Intelligence.",
    "- A empresa transforma dados em informações para apoiar decisões mais inteligentes.",
    "- Slogan: Transformamos dados em decisões.",
    "",
    "SERVIÇOS:",
    "- Business Intelligence.",
    "- Análise de Dados.",
    "- Visualização de Dados.",
    "- Soluções Digitais.",
    "",
    "TECNOLOGIAS:",
    "- Python.",
    "- SQL.",
    "- Pandas.",
    "- Power BI.",
    "- HTML.",
    "- CSS.",
    "- JavaScript.",
    "- Git e GitHub.",
    "",
    "PROJETOS:",
    "- Sales Analytics.",
    "- Customer Insights.",
    "- Business Dashboard.",
    "- DataFlow.",
    "",
    "OBJETIVOS DO ATENDIMENTO:",
    "1. Explicar de forma simples os serviços da Squad G.",
    "2. Apresentar os projetos e tecnologias utilizadas.",
    "3. Orientar o visitante sobre como entrar em contato com a empresa.",
    "",
    "REGRAS DE CONCISÃO E RESPOSTA:",
    "- RESPOSTAS CURTAS: responda em no máximo 2 ou 3 frases.",
    "- Seja extremamente direta e vá ao ponto.",
    "- Evite introduções longas e explicações desnecessárias.",
    "- Destaque nomes de serviços, projetos e tecnologias quando fizer sentido.",
    "- Use listas somente quando forem realmente necessárias.",
    "- Não invente informações sobre a Squad G.",
    "- Se não souber alguma informação, diga que não possui essa informação.",
    "- Se o usuário perguntar sobre um assunto fora do contexto da empresa, redirecione brevemente para os serviços, projetos, tecnologias ou contato da Squad G.",
    "",
].join("\n");

app.get("/", (req, res) => {
    res.json({
        message: "G-Data Assistant API está funcionando!",
    });
});

app.post("/api/chat", async (req, res) => {
    try {
        const { mensagem } = req.body;

        if (!mensagem || typeof mensagem !== "string") {
            return res.status(400).json({
                erro: "Envie uma mensagem válida.",
            });
        }

        const prompt = [
            promptBase,
            `Dúvida do visitante: ${mensagem}`,
        ].join("\n");

        const interaction = await ai.interactions.create({
            model: "gemini-3.7-flash",
            input: prompt,
        });

        res.json({
            resposta: interaction.output_text,
        });
    } catch (error) {
        console.error("Erro no servidor:", error);

        res.status(500).json({
            erro: "Erro ao processar a mensagem.",
        });
    }
});

app.listen(3000, () => {
    console.log(
        "G-Data Assistant rodando em http://localhost:3000"
    );
});