import { TavilySearchResults } from '@langchain/community/tools/tavily_search'

export const get_profile_url_tavily = async (name: string) => {
    const search = new TavilySearchResults({
        apiKey: process.env.TAVILY__API_KEY,
        maxResults: 1,
    })
    const data: any = JSON.parse(await search.invoke(`linkedin: ${name}`))
    const url_candidate = data[0]['url'] as string
    if (!url_candidate.includes('linkedin.com')) {
        console.log(url_candidate)
        throw new Error('Failed to fetch LinkedIn profile! Try again.')
    }
    return url_candidate
}
