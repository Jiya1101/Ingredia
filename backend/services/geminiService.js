const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
    constructor() {
        if (!GeminiService.instance) {
            // Initialize Google Generative AI client only once
            // Ensure GEMINI_API_KEY is set in your .env file
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            console.log('Gemini Service initialized (singleton instance created).');
            GeminiService.instance = this;
        }
        return GeminiService.instance;
    }

    /**
     * Sends a text prompt to the Google Gemini API for analysis.
     * @param {string} prompt - The text prompt to send to the AI.
     * @returns {Promise<string>} - A promise that resolves to the AI's response content (expected to be JSON string).
     */
    async analyzeText(prompt) {
        try {
            // Choose a model that supports JSON output if available, or instruct the prompt
            // 'gemini-pro' is a good general-purpose model.
            // 'gemini-1.5-pro-latest' might be better for complex JSON needs but higher cost.
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-pro',
                // Explicitly request JSON output if the model supports it via response_mime_type
                // This is similar to OpenAI's response_format:{type:"json_object"}
                // Note: Not all Gemini models may strictly enforce this, so prompt engineering is still key.
                generationConfig: {
                    responseMimeType: 'application/json',
                },
            });

            // The 'chat' method is good for conversational turns, but for a single prompt, 'generateContent' is also fine.
            // For a single prompt, generateContent is simpler.
            const result = await model.generateContent(prompt);
            const response = result.response;

            // Gemini's text is typically in response.text()
            const textResponse = response.text();

            // Validate if the response is actually a JSON string before returning
            try {
                JSON.parse(textResponse);
                return textResponse;
            } catch (parseError) {
                console.warn('Gemini response was not a valid JSON string, but text was received:', textResponse);
                // If it's not perfect JSON, you might still return it, or throw an error.
                // For robustness, instruct the prompt very clearly about JSON output.
                throw new Error('Gemini did not return valid JSON. Raw response: ' + textResponse);
            }

        } catch (error) {
            console.error('Error calling Google Gemini API:', error.message);
            // Re-throw to be caught by the controllers's try-catch and errorHandler
            throw new Error('Failed to get analysis from Gemini AI. Please check API key, model, and network connection.');
        }
    }
}

// Export a single instance of the GeminiService
module.exports = new GeminiService();