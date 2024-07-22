export const scrape_linkedin_profile = async (
    linkedin_profile_url: string,
    mock: boolean = false,
) => {
    const mock_linkedin_profile_url =
        'https://gist.githubusercontent.com/emarco177/0d6a3f93dd06634d95e46a2782ed7490/raw/78233eb934aa9850b689471a604465b188e761a0/eden-marco.json'
    const api_endpoint = 'https://nubela.co/proxycurl/api/v2/linkedin'
    const headers = { Authorization: `Bearer ${process.env.PROXYCURL__API_KEY}` }

    let res: any

    if (mock) {
        res = await fetch(mock_linkedin_profile_url, {
            signal: AbortSignal.timeout(10_000),
        })
    } else {
        res = await fetch(
            api_endpoint +
                '?' +
                new URLSearchParams({
                    url: linkedin_profile_url,
                }).toString(),
            {
                headers,
                signal: AbortSignal.timeout(10_000),
            },
        )
    }

    const data: any = await res.json()
    return Object.entries(data)
        .filter(
            ([k, v]) =>
                !['people_also_viewed', 'certifications'].includes(k) &&
                ![[], '', null].includes(v as any),
        )
        .reduce((acc: any, [key, value]) => {
            acc[key] = value
            return acc
        }, {})
}
