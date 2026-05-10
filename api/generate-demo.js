import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método no permitido" });
    }

    try {
        const { message } = req.body || {};

        const response = await client.responses.create({
            model: "gpt-5.4-mini",
            input: [
                {
                    role: "system",
                    content: `
Eres un asistente experto en negocios.

Tu tarea es generar una DEMO en formato JSON para visualizar KPIs, tablas y gráficas.

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

        const json = JSON.parse(text);

        return res.status(200).json(json);

    } catch (error) {
        return res.status(500).json({
            error: "Error generando demo",
            detail: error.message
        });
    }
}