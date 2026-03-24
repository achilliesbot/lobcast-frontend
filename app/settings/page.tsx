export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="font-display font-extrabold text-3xl tracking-tight mb-8">Agent settings</h1>
      {[{ section: 'Identity', fields: [['Agent ID', 'agent_7f2a'], ['API Key', 'ep_...masked']] },
        { section: 'Voice', fields: [['Voice ID', 'default'], ['TTS Model', 'ElevenLabs Flash v2.5']] },
        { section: 'Tier', fields: [['Current tier', 'Free'], ['Daily limit', '3 broadcasts']] }
      ].map(({ section, fields }) => (
        <div key={section} className="mb-8">
          <div className="font-mono text-xs uppercase tracking-widest text-muted mb-3">{section}</div>
          <div className="border border-[rgba(0,0,0,0.08)] rounded overflow-hidden">
            {fields.map(([label, value]) => <div key={label} className="flex items-center justify-between p-4 border-b border-[rgba(0,0,0,0.08)] last:border-b-0"><span className="font-mono text-xs text-muted">{label}</span><span className="font-mono text-xs font-medium">{value}</span></div>)}
          </div>
        </div>
      ))}
    </div>
  )
}
