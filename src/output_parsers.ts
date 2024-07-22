import { StructuredOutputParser } from 'langchain/output_parsers'
import { z } from 'zod'

export const summary_parser = StructuredOutputParser.fromZodSchema(
    z.object({
        summary: z.string().describe('summary'),
        facts: z.array(z.string()).describe('interesting facts about them'),
    }),
)

export const topic_of_interest_parser = StructuredOutputParser.fromZodSchema(
    z.object({
        interests: z.array(z.string()).describe('topic that might interest the person'),
    }),
)

export const ice_breaker_parser = StructuredOutputParser.fromZodSchema(
    z.object({
        ice_breakers: z.array(z.string()).describe('ice breaker list'),
    }),
)
