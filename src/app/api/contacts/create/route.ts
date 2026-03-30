import { NextRequest, NextResponse } from 'next/server'

const HUBSPOT_API = 'https://api.hubapi.com'

export async function POST(request: NextRequest) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN
  if (!token) {
    return NextResponse.json({ success: false, message: 'HUBSPOT_ACCESS_TOKEN not configured' }, { status: 500 })
  }

  let body: { firstname?: string; lastname?: string; email?: string; phone?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 })
  }

  const { firstname, lastname, email, phone } = body

  if (!firstname || !lastname || !email) {
    return NextResponse.json(
      { success: false, message: 'firstname, lastname, and email are required' },
      { status: 400 }
    )
  }

  const properties: Record<string, string> = { firstname, lastname, email }
  if (phone) properties.phone = phone

  const res = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ properties }),
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(
      { success: false, message: data.message ?? 'HubSpot API error' },
      { status: res.status }
    )
  }

  return NextResponse.json({
    success: true,
    contactId: data.id,
    message: `Contact created successfully`,
  })
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
