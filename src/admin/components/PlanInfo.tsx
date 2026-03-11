import type { SubscriptionPlan } from '../../types/subscription.types'

interface PlanInfoProps {
  plan: SubscriptionPlan
}

export default function PlanInfo({ plan }: PlanInfoProps) {
  return (
    <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
      <div className="card-header">
        <h3 className="card-title">Информация о текущем плане</h3>
      </div>
      <div style={{ padding: 'var(--spacing-lg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)' }}>
          <div>
            <div style={{ color: 'var(--gray-500)', fontSize: '12px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>Plan ID</div>
            <div style={{ color: 'var(--gray-700)', fontSize: '14px', fontFamily: 'monospace' }}>{plan.id}</div>
          </div>
          <div>
            <div style={{ color: 'var(--gray-500)', fontSize: '12px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>Название</div>
            <div style={{ color: 'var(--gray-700)', fontSize: '14px', fontWeight: 600 }}>{plan.name}</div>
          </div>
          <div>
            <div style={{ color: 'var(--gray-500)', fontSize: '12px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>Создан</div>
            <div style={{ color: 'var(--gray-700)', fontSize: '14px' }}>{new Date(plan.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <div style={{ color: 'var(--gray-500)', fontSize: '12px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>Обновлён</div>
            <div style={{ color: 'var(--gray-700)', fontSize: '14px' }}>{new Date(plan.updatedAt).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
