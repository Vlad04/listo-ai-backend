import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

function setCorsHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Método no permitido",
            method: req.method
        });
    }

    try {
        const { message } = req.body || {};

        if (!message) {
            return res.status(400).json({
                error: "Falta el mensaje",
                detail: "El body debe incluir { message: '...' }"
            });
        }

        const response = await client.responses.create({
            model: "gpt-5.4-mini",
            input: [
                {
                    role: "system",
                    content: `
Devuelve SOLO JSON válido con esta estructura:
{
  "title": "",
  "summary": "",
  "kpis": [{"label":"", "value":""}],
  "table": {"title":"", "columns":[], "rows":[]},
  "chart": {"title":"", "type":"bar", "labels":[], "data":[]},
  "recommendation": ""
}
`
                },
                {
                    role: "user",
                    content: message
                }
            ]
        });

        const text = response.output_text;

        let json;
        try {
            json = JSON.parse(text);
        } catch (parseError) {
            return res.status(500).json({
                error: "La IA no devolvió JSON válido",
                detail: parseError.message,
                rawResponse: text
            });
        }

        return res.status(200).json(json);

    } catch (error) {
        return res.status(500).json({
            error: "Error generando demo",
            detail: error.message,
            name: error.name,
            status: error.status || null
        });
    }
}