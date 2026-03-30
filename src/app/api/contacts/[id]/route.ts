import { NextRequest, NextResponse } from 'next/server'

const HUBSPOT_API = 'https://api.hubapi.com'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN
  if (!token) {
    return NextResponse.json({ success: false, message: 'HUBSPOT_ACCESS_TOKEN not configured' }, { status: 500 })
  }

  const { id } = await params

  let properties: Record<string, unknown>
  try {
    properties = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 })
  }

  if (!properties || Object.keys(properties).length === 0) {
    return NextResponse.json({ success: false, message: 'Request body must contain at least one property to update' }, { status: 400 })
  }

  const res = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ properties }),
  })

  const data = await res.json()

  if (res.status === 404) {
    return NextResponse.json({ success: false, message: `Contact ${id} not found` }, { status: 404 })
  }

  if (!res.ok) {
    return NextResponse.json(
      { success: false, message: data.message ?? 'HubSpot API error' },
      { status: res.status }
    )
  }

  return NextResponse.json({ success: true, message: `Contact ${id} updated successfully` })
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
