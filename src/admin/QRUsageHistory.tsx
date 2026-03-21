import { useEffect, useState } from 'react'
import axios from 'axios'
import './Admin.css'
import type { User } from '../types/user.types'
import type { MySubscription } from '../types/subscription.types'
import { API_BASE_URL } from '../config'
import Layout from '../components/Layout/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'

interface QRUsage {
  id: string
  subscriptionId: string
  usedAt: string
}

interface QRUsagesResponse {
  usages: QRUsage[]
  total: number
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function formatGroupLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getDateKey(iso: string): string {
  return iso.slice(0, 10)
}

function pluralUses(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'использование'
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'использования'
  return 'использований'
}

export default function QRUsageHistory() {
  const [users, setUsers] = useState<User[] | null>(null)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [subscriptions, setSubscriptions] = useState<MySubscription[] | null>(null)
  const [subsError, setSubsError] = useState<string | null>(null)

  const [usages, setUsages] = useState<QRUsage[] | null>(null)
  const [usagesTotal, setUsagesTotal] = useState(0)
  const [usagesError, setUsagesError] = useState<string | null>(null)

  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    axios.get<User[]>(API_BASE_URL + '/users')
      .then(res => { if (mounted) setUsers(res.data) })
      .catch(err => {
        if (mounted) {
          setUsersError(err.response?.data?.message || err.message || 'Не удалось загрузить пользователей')
          setUsers([])
        }
      })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!selectedUser) {
      setSubscriptions(null)
      setUsages(null)
      return
    }

    let mounted = true
    setSubscriptions(null)
    setSubsError(null)
    setUsages(null)
    setUsagesError(null)

    axios.get<MySubscription[]>(API_BASE_URL + `/subscriptions/my-subscriptions/${selectedUser.id}`)
      .then(res => { if (mounted) setSubscriptions(res.data) })
      .catch(err => {
        if (mounted) {
          setSubsError(err.response?.data?.message || err.message || 'Не удалось загрузить подписки')
          setSubscriptions([])
        }
      })

    axios.get<QRUsagesResponse>(API_BASE_URL + `/qr-code/usages/user/${selectedUser.id}`)
      .then(res => {
        if (mounted) {
          setUsages(res.data.usages)
          setUsagesTotal(res.data.total)
        }
      })
      .catch(err => {
        if (mounted) {
          setUsagesError(err.response?.data?.message || err.message || 'Не удалось загрузить историю')
          setUsages([])
        }
      })

    return () => { mounted = false }
  }, [selectedUser])

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const filteredUsers = users?.filter(u => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q)
    )
  }) ?? []

  const activeSubscription = subscriptions?.find(s => s.isActive) ?? null

  // Group usages by date, sorted newest first
  const groupedUsages: { dateKey: string; label: string; items: QRUsage[] }[] = []
  if (usages && usages.length > 0) {
    const sorted = [...usages].sort((a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime())
    const map = new Map<string, QRUsage[]>()
    for (const u of sorted) {
      const key = getDateKey(u.usedAt)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(u)
    }
    for (const [key, items] of map.entries()) {
      groupedUsages.push({ dateKey: key, label: formatGroupLabel(items[0].usedAt), items })
    }
  }

  return (
    <Layout title="История использования QR-кодов">
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--spacing-lg)', alignItems: 'start' }}>

        {/* ── Left: User List ── */}
        <div className="card" style={{ position: 'sticky', top: '24px', maxHeight: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="card-header" style={{ flexShrink: 0 }}>
            <h3 className="card-title">Пользователи</h3>
            <div className="search-box" style={{ marginTop: '12px', maxWidth: '100%' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => setSearchQuery('')}>×</button>
              )}
            </div>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {!users ? (
              <div style={{ padding: '32px' }}>
                <LoadingSpinner size="small" message="Загрузка..." />
              </div>
            ) : usersError ? (
              <div className="alert alert-error" style={{ margin: '16px' }}>
                <span>{usersError}</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ padding: '32px' }}>
                <EmptyState title="Пользователи не найдены" />
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {filteredUsers.map(u => (
                  <li
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--gray-100)',
                      background: selectedUser?.id === u.id ? '#e7f3ff' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="user-avatar" style={{ flexShrink: 0 }}>
                        {u.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--gray-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.fullName}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.phone || u.email || '—'}
                        </div>
                      </div>
                      {selectedUser?.id === u.id && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2.5" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Right: Details ── */}
        <div>
          {!selectedUser ? (
            <div className="card" style={{ padding: '64px 24px' }}>
              <EmptyState
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                }
                title="Выберите пользователя"
                description="Нажмите на пользователя в списке слева, чтобы просмотреть историю использования QR-кода."
              />
            </div>
          ) : (
            <>
              {/* User Header Card */}
              <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ padding: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div className="user-avatar" style={{ width: '48px', height: '48px', fontSize: '20px', flexShrink: 0 }}>
                    {selectedUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '4px' }}>
                      {selectedUser.fullName}
                    </h3>
                    <div style={{ fontSize: '13px', color: 'var(--gray-500)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {selectedUser.phone && <span>{selectedUser.phone}</span>}
                      {selectedUser.email && <span>{selectedUser.email}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                      Всего использований
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--primary-color)', lineHeight: 1 }}>
                      {usages === null ? '—' : usagesTotal}
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Subscription Card */}
              <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="card-header">
                  <h3 className="card-title">Активная подписка</h3>
                </div>
                <div style={{ padding: 'var(--spacing-lg)' }}>
                  {!subscriptions ? (
                    <LoadingSpinner size="small" message="Загрузка подписки..." />
                  ) : subsError ? (
                    <div className="alert alert-warning">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <span>{subsError}</span>
                    </div>
                  ) : !activeSubscription ? (
                    <EmptyState title="Нет активной подписки" description="У пользователя нет активной подписки." />
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--spacing-lg)' }}>
                      <div className="detail-item">
                        <div className="detail-label">Статус</div>
                        <div className="detail-value">
                          <span className={`badge ${activeSubscription.isActive ? 'badge-success' : 'badge-inactive'}`}>
                            {activeSubscription.isActive ? '● Активна' : '○ Неактивна'}
                          </span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Дата начала</div>
                        <div className="detail-value">{new Date(activeSubscription.startDate).toLocaleDateString('ru-RU')}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Дата окончания</div>
                        <div className="detail-value">{new Date(activeSubscription.endDate).toLocaleDateString('ru-RU')}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Usage History Card */}
              <div className="card">
                <div className="card-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title">История использования QR-кода</h3>
                    {usages !== null && usages.length > 0 && (
                      <span className="badge badge-info" style={{ fontSize: '13px' }}>
                        {usagesTotal} {pluralUses(usagesTotal)}
                      </span>
                    )}
                  </div>
                </div>

                {!usages ? (
                  <div style={{ padding: '48px 24px' }}>
                    <LoadingSpinner size="small" message="Загрузка истории..." />
                  </div>
                ) : usagesError ? (
                  <div style={{ padding: '16px' }}>
                    <div className="alert alert-warning">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <span>{usagesError}</span>
                    </div>
                  </div>
                ) : usages.length === 0 ? (
                  <div style={{ padding: '48px 24px' }}>
                    <EmptyState
                      icon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                        </svg>
                      }
                      title="QR-код ещё не использовался"
                      description="Этот пользователь ещё не использовал свой QR-код."
                    />
                  </div>
                ) : (
                  <div>
                    {groupedUsages.map((group, gi) => {
                      const rowOffset = groupedUsages.slice(0, gi).reduce((s, g) => s + g.items.length, 0)
                      return (
                        <div key={group.dateKey}>
                          {/* Date Group Header */}
                          <div style={{
                            padding: '10px 16px',
                            background: 'var(--gray-50)',
                            borderTop: gi > 0 ? '2px solid var(--gray-200)' : undefined,
                            borderBottom: '1px solid var(--gray-200)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                              <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--gray-700)' }}>
                                {group.label}
                              </span>
                            </div>
                            <span className="badge badge-info" style={{ fontSize: '12px' }}>
                              {group.items.length} {pluralUses(group.items.length)}
                            </span>
                          </div>

                          {/* Usage Table */}
                          <div className="table-container">
                            <table className="data-table">
                              <thead>
                                <tr>
                                  <th style={{ width: '52px' }}>#</th>
                                  <th>Дата</th>
                                  <th>Время</th>
                                  <th>ID подписки</th>
                                </tr>
                              </thead>
                              <tbody>
                                {group.items.map((usage, idx) => (
                                  <tr key={usage.id}>
                                    <td style={{ color: 'var(--gray-400)', fontWeight: 500 }}>
                                      {rowOffset + idx + 1}
                                    </td>
                                    <td>{formatDate(usage.usedAt)}</td>
                                    <td>{formatTime(usage.usedAt)}</td>
                                    <td>
                                      <button
                                        onClick={() => handleCopy(usage.subscriptionId)}
                                        title={`Скопировать: ${usage.subscriptionId}`}
                                        style={{
                                          background: copiedId === usage.subscriptionId ? '#c6f6d5' : 'var(--gray-100)',
                                          border: 'none',
                                          borderRadius: 'var(--radius-sm)',
                                          padding: '4px 10px',
                                          cursor: 'pointer',
                                          fontFamily: 'monospace',
                                          fontSize: '12px',
                                          color: copiedId === usage.subscriptionId ? '#22543d' : 'var(--gray-700)',
                                          transition: 'all 0.2s',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '5px',
                                        }}
                                      >
                                        {copiedId === usage.subscriptionId ? (
                                          <>
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                              <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            Скопировано
                                          </>
                                        ) : (
                                          <>
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                            </svg>
                                            {usage.subscriptionId.slice(0, 8)}…
                                          </>
                                        )}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </Layout>
  )
}
