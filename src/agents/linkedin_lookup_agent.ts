import { PromptTemplate } from '@langchain/core/prompts'
import { tool } from '@langchain/core/tools'
import { AgentExecutor, createReactAgent } from 'langchain/agents'
import { pull } from 'langchain/hub'
import z from 'zod'

import { get_profile_url_tavily } from '../tools'
import { llama3_groq_8b_ts as ts } from '../usable_resources'

export const lookup = async (name: string) => {
    const template = `given the full name {name_of_person} I want you to get it me a link to their Linkedin profile page.
                          Your answer will be a URL`
    const prompt_template = new PromptTemplate({ template, inputVariables: ['name_of_person'] })

    const tools = [
        // new DynamicTool({
        //     name: 'Crawl Google for linkedin profile page',
        //     description: 'useful for when you need get the Linkedin Page URL',
        //     func: get_profile_url_tavily,
        // }),
        // new DynamicStructuredTool({
        //     name: 'LinkedInProfileLookup',
        //     description: `Fetches the LinkedIn profile URL for a given person's name using a search API. Put the person's name in an object.`,
        //     schema: z.object({
        //         name: z
        //             .string()
        //             .describe(
        //                 `A string representing the full name of the person whose LinkedIn profile URL you want to retrieve.`,
        //             ),
        //     }),
        //     func: async ({ name }) => {
        //         return await get_profile_url_tavily(name)
        //     },
        // }),
        tool(async (name) => get_profile_url_tavily(name), {
            name: 'LinkedInProfileLookup',
            description: `Fetches the LinkedIn profile URL for a given person's name using a search API.`,
            schema: z
                .string()
                .describe(
                    `A string representing the full name of the person whose LinkedIn profile URL you want to retrieve.`,
                ),
        }),
    ]

    const react_prompt = await pull<PromptTemplate>('hwchase17/react')

    const agent = await createReactAgent({
        llm: ts,
        tools,
        prompt: react_prompt,
    })

    const agent_executer = new AgentExecutor({
        agent,
        tools,
        // verbose: true,
    })

    const res = await agent_executer.invoke({
        input: await prompt_template.format({
            name_of_person: name,
        }),
    })

    const linked_profile_url = res['output']
    return linked_profile_url
}
