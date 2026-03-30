import { NextRequest, NextResponse } from 'next/server'

const HUBSPOT_API = 'https://api.hubapi.com'

export async function GET(request: NextRequest) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN
  if (!token) {
    return NextResponse.json({ success: false, message: 'HUBSPOT_ACCESS_TOKEN not configured' }, { status: 500 })
  }

  const query = request.nextUrl.searchParams.get('query')
  if (!query) {
    return NextResponse.json({ success: false, message: 'query parameter is required' }, { status: 400 })
  }

  const res = await fetch(`${HUBSPOT_API}/crm/v3/objects/deals/search`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      properties: ['dealname', 'amount', 'dealstage', 'closedate'],
      limit: 10,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(
      { success: false, message: data.message ?? 'HubSpot API error' },
      { status: res.status }
    )
  }

  const deals = (data.results ?? []).map((deal: { properties: Record<string, string | null> }) => ({
    dealname: deal.properties.dealname ?? '',
    amount: deal.properties.amount ?? '',
    dealstage: deal.properties.dealstage ?? '',
    closedate: deal.properties.closedate ?? '',
  }))

  return NextResponse.json(deals)
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
