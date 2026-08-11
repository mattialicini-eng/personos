export default function CrmTab() {
  const people = {
    high: [
      { name: 'Marco Rossi', note: 'Richiamare per approvazione budget - 2 giorni fa' },
      { name: 'Francesca Bianchi', note: 'Ricerca di mercato per Q4 - in attesa' }
    ],
    medium: [
      { name: 'Paolo Verdi', note: 'Feedback su prototipo' },
      { name: 'Elena Ferrari', note: 'Coordinamento con design team' }
    ],
    low: [
      { name: 'Luca Russo', note: 'Aggiornamento trimestrale' },
      { name: 'Sara Colombo', note: 'Coffee chat - quando hai tempo' }
    ]
  }

  const renderPeople = (items, urgency) => {
    return items.map((person, i) => (
      <div key={i} className={`person-item urgency-${urgency}`}>
        <div className="person-name">{person.name}</div>
        <div className="person-note">{person.note}</div>
      </div>
    ))
  }

  return (
    <>
      <div className="card" style={{ gridColumn: 'span 2' }}>
        <h2>🔴 Urgente</h2>
        {renderPeople(people.high, 'high')}
      </div>

      <div className="card" style={{ gridColumn: 'span 2' }}>
        <h2>🟡 Medio</h2>
        {renderPeople(people.medium, 'medium')}
      </div>

      <div className="card" style={{ gridColumn: 'span 2' }}>
        <h2>🟢 Basso</h2>
        {renderPeople(people.low, 'low')}
      </div>
    </>
  )
}
