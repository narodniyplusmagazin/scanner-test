import type { SubscriptionPlan } from '../../types/subscription.types'

interface PlanInfoProps {
  plan: SubscriptionPlan
}

export default function PlanInfo({ plan }: PlanInfoProps) {
  return (
    <div style={{ marginTop: 32, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 4 }}>
      <h3>Current Plan Info</h3>
      <p><strong>ID:</strong> {plan.id}</p>
      <p><strong>Name:</strong> {plan.name}</p>
      <p><strong>Created:</strong> {new Date(plan.createdAt).toLocaleString()}</p>
      <p><strong>Updated:</strong> {new Date(plan.updatedAt).toLocaleString()}</p>
    </div>
  )
}
