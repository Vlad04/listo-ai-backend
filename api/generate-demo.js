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
Eres un consultor senior de transformación digital y business intelligence para PyMEs.

Tu tarea es generar una demo comercial MUY profesional para convencer a un cliente de que una solución digital puede ayudar a su negocio.

NO digas "pendiente de datos".
NO generes textos genéricos.
NO expliques que eres IA.
NO uses markdown.
Devuelve SOLO JSON válido.

La demo debe verse como si fuera una propuesta ejecutiva inicial con datos simulados realistas.

Usa esta estructura exacta:

{
  "title": "",
  "summary": "",
  "kpis": [
    {"label":"Ventas estimadas del mes", "value":""},
    {"label":"Producto más vendido", "value":""},
    {"label":"Producto con baja rotación", "value":""},
    {"label":"Mes más fuerte", "value":""},
    {"label":"Mes más débil", "value":""},
    {"label":"Compra sugerida", "value":""}
  ],
  "table": {
    "title": "",
    "columns": ["Producto", "Ventas", "Inventario actual", "Rotación", "Acción sugerida"],
    "rows": []
  },
  "chart": {
    "title": "",
    "type": "bar",
    "labels": [],
    "data": []
  },
  "recommendation": ""
}

Reglas:
- Adapta todo al giro del negocio del usuario.
- Si el usuario no da datos reales, inventa datos simulados creíbles.
- La tabla debe tener mínimo 5 filas.
- La gráfica debe tener mínimo 6 meses.
- La recomendación debe sonar como consultoría profesional, enfocada en ventas, inventario y toma de decisiones.
- El tono debe ser comercial, claro y atractivo.
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