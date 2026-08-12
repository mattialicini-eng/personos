import MemorySearch from '../MemorySearch'

export default function MemoryTab({ data }) {
  return (
    <>
      <div className="card" style={{ gridColumn: 'span 2' }}>
        <MemorySearch />
      </div>

      <div className="card" style={{ gridColumn: 'span 2' }}>
        <h2>📝 Informazioni</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '1rem' }}>
          La memoria semantica usa embeddings per trovare note e informazioni simili a quello che cerchi.
        </p>
        <div style={{ fontSize: '0.875rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <strong>Come funziona:</strong>
          </div>
          <ul style={{ marginLeft: '1.5rem', color: 'var(--text-light)' }}>
            <li>Scrivi una ricerca</li>
            <li>Viene convertita in un vettore (embedding) usando OpenAI</li>
            <li>Cerchiamo note con embedding simile nel database</li>
            <li>Risultati ordinati per somiglianza</li>
          </ul>
        </div>
      </div>
    </>
  )
}
