export default function CrmTab({ data }) {
  if (!data?.people) {
    return <div>No data</div>
  }

  const people = data.people || []

  // Group by some field (for now just show all)
  const allPeople = people.slice(0, 10)

  return (
    <>
      <div className="card" style={{ gridColumn: 'span 2' }}>
        <h2>👥 Persone</h2>
        {allPeople.length === 0 ? (
          <div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
            Nessuna persona registrata
          </div>
        ) : (
          allPeople.map((person) => (
            <div key={person.id} className="person-item">
              <div className="person-name">{person.name}</div>
              <div className="person-note">
                {person.organization && `${person.organization} • `}
                {person.type || 'Contatto'}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
