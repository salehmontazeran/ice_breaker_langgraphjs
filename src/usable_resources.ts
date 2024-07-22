import { ChatGroq } from '@langchain/groq'
import { ChatOpenAI } from '@langchain/openai'

export const open_ai_llm = new ChatOpenAI({
    apiKey: process.env.OPENAI__API_KEY,
    model: 'gpt-4o-mini',
})

export const llama3_groq_8b_ts = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama3-groq-8b-8192-tool-use-preview',
})

export const llama3_groq_70b_llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama3-70b-8192',
})

export const general_llm = llama3_groq_70b_llm
