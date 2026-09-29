require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function testGemini() {
    try {
        console.log("Testing Gemini model:", process.env.GEMINI_MODEL);

        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL,
            contents: "Reply with exactly: Gemini API is working correctly.",
        });

        console.log("\n==============================");
        console.log(" GEMINI API TEST SUCCESS");
        console.log("==============================");
        console.log(response.text);
        console.log("==============================\n");

    } catch (error) {
        console.error("\nGemini API Error:");
        console.error(error.message);
    }
}

testGemini();