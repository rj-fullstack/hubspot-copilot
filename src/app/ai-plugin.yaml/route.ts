import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    `${request.nextUrl.protocol}//${request.headers.get('host')}`

  const yaml = `schema_version: v2.1

name_for_model: hubspot_crm
name_for_human: HubSpot CRM
description_for_model: >
  Plugin for managing HubSpot CRM data. Use this plugin to create new contacts,
  update existing contact properties, and search for deals by keyword.
description_for_human: >
  Create and update HubSpot contacts and search deals from Microsoft 365 Copilot.

contact_email: admin@taraaisolutions.com

auth:
  type: none

api:
  type: openapi
  url: ${baseUrl}/openapi.json

logo_url: ${baseUrl}/color.png

actions:
  - id: createContact
    description: Creates a new contact in HubSpot CRM with first name, last name, email, and optional phone.

  - id: updateContact
    description: Updates properties on an existing HubSpot contact by contact ID.

  - id: searchDeals
    description: Searches HubSpot deals by keyword. Returns deal name, amount, stage, and close date.
`

  return new NextResponse(yaml, {
    headers: { 'Content-Type': 'application/yaml' },
  })
}
