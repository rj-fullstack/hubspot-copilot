export default function Home() {
  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem' }}>
      <h1>HubSpot CRM — M365 Copilot Plugin API</h1>
      <p>Status: <strong>online</strong></p>
      <h2>Routes</h2>
      <ul>
        <li>GET /openapi.json</li>
        <li>GET /ai-plugin.yaml</li>
        <li>POST /api/contacts/create</li>
        <li>PATCH /api/contacts/[id]</li>
        <li>GET /api/deals/search?query=...</li>
      </ul>
    </main>
  )
}
