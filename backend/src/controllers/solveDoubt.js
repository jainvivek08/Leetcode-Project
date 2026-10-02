const { GoogleGenAI } = require("@google/genai");


const solveDoubt = async(req , res)=>{


    try{

        const {messages,title,description,testCases,startCode} = req.body;

        if (!Array.isArray(messages)) {
            return res.status(400).json({ message: "Messages must be an array" });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

        // Cap messages to the last 20 items and cap each message text to 4000 chars
        const cappedMessages = messages.slice(-20).map(m => {
            if (!m || typeof m !== 'object') return m;
            const parts = Array.isArray(m.parts) ? m.parts.map(p => {
                if (p && typeof p.text === 'string') {
                    return { ...p, text: p.text.slice(0, 4000) };
                }
                return p;
            }) : [];
            return { ...m, parts };
        });

        // Sanitize messages: filter out any previous error messages
        let validContents = cappedMessages.filter(m => {
            const text = m.parts?.[0]?.text;
            return text && !text.includes("Error from AI Chatbot");
        });

        // Gemini generateContent requires conversation to end with a user turn
        while (validContents.length > 0 && validContents[validContents.length - 1].role === 'model') {
            validContents.pop();
        }

        if (validContents.length === 0) {
            validContents.push({ role: 'user', parts: [{ text: "Can you help me understand this problem?" }] });
        }

        // Cap title/description/testCases/startCode fields (10000 chars each, truncate)
        const safeTitle = String(title || '').slice(0, 10000);
        const safeDescription = String(description || '').slice(0, 10000);
        const formattedTestCases = (typeof testCases === 'object' ? JSON.stringify(testCases, null, 2) : String(testCases || '')).slice(0, 10000);
        const formattedStartCode = (typeof startCode === 'object' ? JSON.stringify(startCode, null, 2) : String(startCode || '')).slice(0, 10000);
       
        const systemInstruction = `
You are an expert Data Structures and Algorithms (DSA) tutor specializing in helping users solve coding problems. Your role is strictly limited to DSA-related assistance only.

## CURRENT PROBLEM CONTEXT:
[PROBLEM_TITLE]: ${safeTitle}
[PROBLEM_DESCRIPTION]: ${safeDescription}
[EXAMPLES]: ${formattedTestCases}
[startCode]: ${formattedStartCode}



## YOUR CAPABILITIES:
1. **Hint Provider**: Give step-by-step hints without revealing the complete solution
2. **Code Reviewer**: Debug and fix code submissions with explanations
3. **Solution Guide**: Provide optimal solutions with detailed explanations
4. **Complexity Analyzer**: Explain time and space complexity trade-offs
5. **Approach Suggester**: Recommend different algorithmic approaches (brute force, optimized, etc.)
6. **Test Case Helper**: Help create additional test cases for edge case validation

## INTERACTION GUIDELINES:

### When user asks for HINTS:
- Break down the problem into smaller sub-problems
- Ask guiding questions to help them think through the solution
- Provide algorithmic intuition without giving away the complete approach
- Suggest relevant data structures or techniques to consider

### When user submits CODE for review:
- Identify bugs and logic errors with clear explanations
- Suggest improvements for readability and efficiency
- Explain why certain approaches work or don't work
- Provide corrected code with line-by-line explanations when needed

### When user asks for OPTIMAL SOLUTION:
- Start with a brief approach explanation
- Provide clean, well-commented code
- Explain the algorithm step-by-step
- Include time and space complexity analysis
- Mention alternative approaches if applicable

### When user asks for DIFFERENT APPROACHES:
- List multiple solution strategies (if applicable)
- Compare trade-offs between approaches
- Explain when to use each approach
- Provide complexity analysis for each

## RESPONSE FORMAT:
- Use clear, concise explanations
- Format code with proper syntax highlighting
- Use examples to illustrate concepts
- Break complex explanations into digestible parts
- Always relate back to the current problem context
- Always response in the Language in which user is comfortable or given the context

## STRICT LIMITATIONS:
- ONLY discuss topics related to the current DSA problem
- DO NOT help with non-DSA topics (web development, databases, etc.)
- DO NOT provide solutions to different problems
- If asked about unrelated topics, politely redirect: "I can only help with the current DSA problem. What specific aspect of this problem would you like assistance with?"

## TEACHING PHILOSOPHY:
- Encourage understanding over memorization
- Guide users to discover solutions rather than just providing answers
- Explain the "why" behind algorithmic choices
- Help build problem-solving intuition
- Promote best coding practices

Remember: Your goal is to help users learn and understand DSA concepts through the lens of the current problem, not just to provide quick answers.
`;

        const primaryModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || 'gemini-1.5-pro';

        let response;
        try {
            response = await ai.models.generateContent({
                model: primaryModel,
                contents: validContents,
                config: { systemInstruction }
            });
        } catch (firstErr) {
            console.warn(`Primary model ${primaryModel} failed (${firstErr.message}), falling back to ${fallbackModel}...`);
            if (fallbackModel && fallbackModel !== primaryModel) {
                response = await ai.models.generateContent({
                    model: fallbackModel,
                    contents: validContents,
                    config: { systemInstruction }
                });
            } else {
                throw firstErr;
            }
        }

        return res.status(201).json({
            message: response.text
        });
    }
    catch(err){
        console.error("solveDoubt error:", err.message || err);

        const errMsg = String(err.message || '');
        const errStatus = err.status || err.statusCode || (err.response && err.response.status);

        const isRateLimit = errStatus === 429 || /429|quota|rate limit|resource_exhausted/i.test(errMsg);
        const isNotFound = errStatus === 404 || /404|not found/i.test(errMsg);
        const isUnavailable = errStatus === 503 || /503|unavailable|overloaded/i.test(errMsg);

        if (isRateLimit) {
            return res.status(429).json({
                message: "AI helper is busy or unavailable, please try again in a moment."
            });
        }

        if (isNotFound || isUnavailable) {
            return res.status(503).json({
                message: "AI helper is busy or unavailable, please try again in a moment."
            });
        }

        return res.status(503).json({
            message: "AI helper is busy or unavailable, please try again in a moment."
        });
    }
}

module.exports = solveDoubt;
