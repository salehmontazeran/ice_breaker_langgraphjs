// import { ChatAnthropic } from '@langchain/anthropic'
// import { lookup } from './agents/linkedin_lookup_agent'
// import {
//     get_ice_breaker_chain,
//     get_interest_chain,
//     get_summary_chain,
// } from './chains/custom_chains'
// import { scrape_linkedin_profile } from './third_parties/linkedin'
// ;(async () => {
//     const p = await lookup('Saleh Montazeran')
//     console.log(p)
//     const linkedin_profile = await scrape_linkedin_profile(p, false)
//     const linkedin_profile_ctx = `Job headline: ${linkedin_profile['headline']} - Carear summary: ${linkedin_profile['summary']}`
//     console.log(linkedin_profile_ctx)
//     const summary_chain = get_summary_chain()
//     const summary = await summary_chain.invoke({ information: linkedin_profile_ctx })
//     console.log(summary)
//     const interests_chain = get_interest_chain()
//     const interests = await interests_chain.invoke({ information: linkedin_profile_ctx })
//     console.log(interests)
//     const ice_breaker_chain = get_ice_breaker_chain()
//     const ice_break = await ice_breaker_chain.invoke({ information: linkedin_profile_ctx })
//     console.log(ice_break)
// })()
import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph'
import { MemorySaver } from '@langchain/langgraph'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import 'dotenv/config'
import { z } from 'zod'

import { llama3_groq_8b_ts } from './usable_resources'

;(async () => {
    // Define the state interface
    interface AgentState {
        messages: HumanMessage[]
    }

    // Define the graph state
    const graphState: StateGraphArgs<AgentState>['channels'] = {
        messages: {
            value: (x: HumanMessage[], y: HumanMessage[]) => x.concat(y),
            default: () => [],
        },
    }

    // Define the tools for the agent to use

    const searchTool = new DynamicStructuredTool({
        name: 'search',
        description: 'Call to surf the web.',
        schema: z.object({
            query: z.string().describe('The query to use in your search.'),
        }),
        func: async ({ query }: { query: string }) => {
            // This is a placeholder for the actual implementation
            if (
                query.toLowerCase().includes('sf') ||
                query.toLowerCase().includes('san francisco')
            ) {
                return "It's 60 degrees and foggy."
            }
            return "It's 90 degrees and sunny."
        },
    })

    const tools = [searchTool]
    const toolNode = new ToolNode<AgentState>(tools)

    // const model = new ChatAnthropic({
    //     apiKey: process.env.ANTHROPIC__API_KEY,
    //     model: 'claude-3-5-sonnet-20240620',
    //     temperature: 0,
    // }).bindTools(tools)

    const model = llama3_groq_8b_ts.bindTools(tools)

    // Define the function that determines whether to continue or not
    function shouldContinue(state: AgentState): 'tools' | typeof END {
        const messages = state.messages
        const lastMessage = messages[messages.length - 1] as AIMessage

        // If the LLM makes a tool call, then we route to the "tools" node
        if (lastMessage.tool_calls?.length) {
            return 'tools'
        }
        // Otherwise, we stop (reply to the user)
        return END
    }

    // Define the function that calls the model
    async function callModel(state: AgentState) {
        const messages = state.messages
        const response = await model.invoke(messages)

        // We return a list, because this will get added to the existing list
        return { messages: [response] }
    }

    // Define a new graph
    const workflow = new StateGraph<AgentState>({ channels: graphState })
        .addNode('agent', callModel)
        .addNode('tools', toolNode)
        .addEdge(START, 'agent')
        .addConditionalEdges('agent', shouldContinue)
        .addEdge('tools', 'agent')

    // Initialize memory to persist state between graph runs
    const checkpointer = new MemorySaver()

    // Finally, we compile it!
    // This compiles it into a LangChain Runnable.
    // Note that we're (optionally) passing the memory when compiling the graph
    const app = workflow.compile({ checkpointer })

    // Use the Runnable
    const finalState = await app.invoke(
        {
            messages: [
                new HumanMessage(
                    'what is the weather in sf. (You can use search tool to get weather for any city).',
                ),
            ],
        },
        { configurable: { thread_id: '42' } },
    )
    console.log(finalState.messages[finalState.messages.length - 1].content)
})()
