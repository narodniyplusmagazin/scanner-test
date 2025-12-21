interface StatusMessagesProps {
  saveSuccess: boolean
  saveError: string | null
}

export default function StatusMessages({ saveSuccess, saveError }: StatusMessagesProps) {
  return (
    <>
      {saveSuccess && (
        <div style={{ color: 'green', marginBottom: 16, padding: 12, backgroundColor: '#d4edda', borderRadius: 4 }}>
          Plan saved successfully!
        </div>
      )}
      {saveError && (
        <div style={{ color: 'red', marginBottom: 16, padding: 12, backgroundColor: '#f8d7da', borderRadius: 4 }}>
          Error: {saveError}
        </div>
      )}
    </>
  )
}
