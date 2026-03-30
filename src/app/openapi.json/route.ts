import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    `${request.nextUrl.protocol}//${request.headers.get('host')}`

  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'HubSpot CRM API',
      description: 'API for managing HubSpot CRM contacts and deals via Microsoft 365 Copilot.',
      version: '1.0.0',
    },
    servers: [{ url: baseUrl }],
    paths: {
      '/api/contacts/create': {
        post: {
          operationId: 'createContact',
          summary: 'Create a new HubSpot contact',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateContactRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Contact created successfully',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/CreateContactResponse' } },
              },
            },
            '400': { description: 'Missing required fields' },
            '500': { description: 'Server or HubSpot API error' },
          },
        },
      },
      '/api/contacts/{id}': {
        patch: {
          operationId: 'updateContact',
          summary: 'Update an existing HubSpot contact',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateContactRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Contact updated successfully',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/UpdateContactResponse' } },
              },
            },
            '404': { description: 'Contact not found' },
            '500': { description: 'Server or HubSpot API error' },
          },
        },
      },
      '/api/deals/search': {
        get: {
          operationId: 'searchDeals',
          summary: 'Search HubSpot deals',
          parameters: [
            { name: 'query', in: 'query', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': {
              description: 'Search results',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/Deal' } },
                },
              },
            },
            '400': { description: 'Missing query parameter' },
            '500': { description: 'Server or HubSpot API error' },
          },
        },
      },
    },
    components: {
      schemas: {
        CreateContactRequest: {
          type: 'object',
          required: ['firstname', 'lastname', 'email'],
          properties: {
            firstname: { type: 'string' },
            lastname: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
          },
        },
        CreateContactResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            contactId: { type: 'string' },
            message: { type: 'string' },
          },
        },
        UpdateContactRequest: {
          type: 'object',
          additionalProperties: true,
          description: 'Any valid HubSpot contact properties',
        },
        UpdateContactResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        Deal: {
          type: 'object',
          properties: {
            dealname: { type: 'string' },
            amount: { type: 'string' },
            dealstage: { type: 'string' },
            closedate: { type: 'string' },
          },
        },
      },
    },
  }

  return NextResponse.json(spec, {
    headers: { 'Content-Type': 'application/json' },
  })
}
