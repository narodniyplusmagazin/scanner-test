import { useEffect, useState } from 'react'
import axios from 'axios'
import './Admin.css'
import type { User } from '../types/user.types'
import type { MySubscription } from '../types/subscription.types'
import type { Payment } from '../types/payment.types'
import { API_BASE_URL } from '../config'
import Layout from '../components/Layout/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import EmptyState from '../components/common/EmptyState'
import CreateSubscriptionForm from './components/CreateSubscriptionForm'

export default function UsersList() {
  const [users, setUsers] = useState<User[] | null>(null)
  const [subscriptions, setSubscriptions] = useState<MySubscription[] | null>(null)
  const [payments, setPayments] = useState<Payment[] | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [subscriptionsError, setSubscriptionsError] = useState<string | null>(null)
  const [paymentsError, setPaymentsError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 25


  useEffect(() => {
    let mounted = true
    setLoadError(null)
    axios.get<User[]>(API_BASE_URL+'/users')
      .then(response => { if (mounted) setUsers(response.data) })
      .catch((error) => { 
        if (mounted) {
          setLoadError(error.response?.data?.message || error.message || 'Не удалось загрузить пользователей')
          setUsers([])
        }
      })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!selectedUserId) {
      setSubscriptions(null)
      setPayments(null)
      return
    }
    
    let mounted = true
    setSubscriptionsError(null)
    setSubscriptions(null)
    
    axios.get<MySubscription[]>(API_BASE_URL+`/subscriptions/my-subscriptions/${selectedUserId}`)
      .then(response => { if (mounted) setSubscriptions(response.data) })
      .catch((error) => {
        if (mounted) {
          setSubscriptionsError(error.response?.data?.message || error.message || 'Не удалось загрузить подписки')
          setSubscriptions([])
        }
      })
    return () => { mounted = false }
  }, [selectedUserId])

  useEffect(() => {
    if (!selectedUserId) {
      setPayments(null)
      return
    }
    
    let mounted = true
    setPaymentsError(null)
    setPayments(null)
    
    axios.get<Payment[]>(API_BASE_URL+`/payments/my-payments/${selectedUserId}`)
      .then(response => { if (mounted) setPayments(response.data) })
      .catch((error) => {
        if (mounted) {
          setPaymentsError(error.response?.data?.message || error.message || 'Не удалось загрузить платежи')
          setPayments([])
        }
      })
    return () => { mounted = false }
  }, [selectedUserId])

  const handleDelete = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return

    setDeleting(userId)
    setDeleteError(null)

    try {
      await axios.delete(API_BASE_URL+`/users/${userId}`)

      // Remove user from local state
      setUsers(prev => prev ? prev.filter(u => u.id !== userId) : prev)
      
      // Clear selection if deleted user was selected
      if (selectedUserId === userId) {
        setSelectedUserId(null)
        setSelectedUser(null)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setDeleteError(error.response?.data?.message || error.message)
      } else {
        setDeleteError('Не удалось удалить пользователя')
      }
    } finally {
      setDeleting(null)
    }
  }

  const handleSelectUser = (user: User) => {
    setSelectedUserId(user.id)
    setSelectedUser(user)
  }

  const handleCreateSubscription = () => {
    if (!selectedUserId) {
      alert('Сначала выберите пользователя')
      return
    }
    setShowCreateModal(true)
  }

  const handleSubscriptionCreated = () => {
    setShowCreateModal(false)
    // Reload subscriptions for selected user
    if (selectedUserId) {
      setSubscriptionsError(null)
      setSubscriptions(null)
      
      axios.get<MySubscription[]>(API_BASE_URL+`/subscriptions/my-subscriptions/${selectedUserId}`)
        .then(response => setSubscriptions(response.data))
        .catch((error) => {
          setSubscriptionsError(error.response?.data?.message || error.message || 'Не удалось загрузить подписки')
          setSubscriptions([])
        })
    }
  }

  const filteredUsers = users?.filter(user => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      user.fullName.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query)
    )
  }) || []

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE)
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  
  console.log(selectedUserId);
  console.log(subscriptions);
  
  
  if (!users) return (
    <Layout title="Пользователи">
      <LoadingSpinner message="Загрузка пользователей..." />
    </Layout>
  )

  if (loadError) return (
    <Layout title="Пользователи">
      <ErrorMessage 
        message={loadError}
        onRetry={() => window.location.reload()}
      />
    </Layout>
  )

  return (
    <Layout title={`Пользователи (${users.length})`}>
      <div className="admin-container">
        {deleteError && (
          <div className="alert alert-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{deleteError}</span>
            <button className="alert-close" onClick={() => setDeleteError(null)}>×</button>
          </div>
        )}

        {users.length === 0 ? (
          <EmptyState
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
            title="Пользователей пока нет"
            description="Создайте первого пользователя, чтобы начать."
          />
        ) : (
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <h3 className="card-title">
                  Все пользователи ({searchQuery ? `${filteredUsers.length} из ${users.length}` : users.length})
                </h3>
                <div className="search-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Поиск пользователей..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                    className="search-input"
                  />
                  {searchQuery && (
                    <button className="search-clear" onClick={() => { setSearchQuery(''); setCurrentPage(1) }}>×</button>
                  )}
                </div>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Имя</th>
                    <th>Телефон</th>
                    <th>Email</th>
                    <th>Пол</th>
                    <th>Дата создания</th>
                    <th className="actions-column">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '48px' }}>
                        <EmptyState
                          title="Пользователи не найдены"
                          description={searchQuery ? `Нет пользователей, совпадающих с "${searchQuery}"` : "В системе нет пользователей"}
                        />
                      </td>
                    </tr>
                  ) : (
                  paginatedUsers.map(u => (
                    <tr 
                      key={u.id}
                      className={selectedUserId === u.id ? 'row-selected' : ''}
                    >
                      <td>
                        <div className="user-name">
                          <div className="user-avatar">
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <span>{u.fullName}</span>
                        </div>
                      </td>
                      <td>{u.phone || '—'}</td>
                      <td>{u.email || '—'}</td>
                      <td>
                        <span className="badge badge-neutral">{u.gender}</span>
                      </td>
                     
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleSelectUser(u)}
                            className={`btn btn-sm ${selectedUserId === u.id ? 'btn-primary-active' : 'btn-primary'}`}
                          >
                            {selectedUserId === u.id ? '✓ Выбран' : 'Подробнее'}
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={deleting === u.id}
                            className="btn btn-sm btn-danger"
                          >
                            {deleting === u.id ? 'Удаление...' : 'Удалить'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px' }}>
                <button
                  className="btn btn-sm btn-primary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`btn btn-sm ${currentPage === page ? 'btn-primary-active' : 'btn-primary'}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="btn btn-sm btn-primary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        )}

        <div className="subscriptions-section">
          <h2 className="section-title">Данные пользователя</h2>
          {!selectedUserId || !selectedUser ? (
            <EmptyState
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
              title="Пользователь не выбран"
              description="Выберите пользователя из таблицы выше, чтобы просмотреть его данные и подписки."
            />
          ) : (
            <>
              <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="user-avatar" style={{ width: '48px', height: '48px', fontSize: '20px' }}>
                      {selectedUser.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 className="card-title" style={{ marginBottom: '4px' }}>{selectedUser.fullName}</h3>
                      <div style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
                        ID: <code style={{ background: 'var(--gray-100)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{selectedUser.id}</code>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 'var(--spacing-lg)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)' }}>
                    <div className="detail-item">
                      <div className="detail-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        Телефон
                      </div>
                      <div className="detail-value">{selectedUser.phone || '—'}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        Email
                      </div>
                      <div className="detail-value">{selectedUser.email || '—'}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        Пол
                      </div>
                      <div className="detail-value">
                        <span className="badge badge-neutral">{selectedUser.gender}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Дата создания
                      </div>
                      <div className="detail-value">{new Date(selectedUser.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Последнее обновление
                      </div>
                      <div className="detail-value">{new Date(selectedUser.updatedAt).toLocaleString()}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                        Всего подписок
                      </div>
                      <div className="detail-value">
                        <span className="badge badge-info" style={{ fontSize: '14px' }}>
                          {selectedUser?._count?.subscriptions || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title">История подписок</h3>
                    <button
                      onClick={handleCreateSubscription}
                      className="btn btn-success"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Создать подписку
                    </button>
                  </div>
                </div>

                {subscriptionsError && (
                  <div className="alert alert-warning">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>{subscriptionsError}</span>
                  </div>
                )}

                {!subscriptions ? (
                  <div style={{ padding: '48px 24px' }}>
                    <LoadingSpinner size="small" message="Загрузка подписок..." />
                  </div>
                ) : subscriptions.length === 0 ? (
                  <div style={{ padding: '32px 24px' }}>
                    <EmptyState
                      title="Нет подписок"
                      description="У этого пользователя пока нет подписок."
                    />
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          {/* <th>ID</th> */}
                          <th>Тариф</th>
                          <th>Дата начала</th>
                          <th>Дата окончания</th>
                          <th>Статус</th>
                          <th>Дата создания</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptions.map(sub => (
                          <tr key={sub.id}>
                            <td>
                              <strong>{sub?.plan?.name || sub.planId || 'N/A'}</strong>
                            </td>
                            <td>{new Date(sub.startDate).toLocaleDateString()}</td>
                            <td>{new Date(sub.endDate).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${sub.isActive ? 'badge-success' : 'badge-inactive'}`}>
                                {sub.isActive ? '● Активна' : '○ Неактивна'}
                              </span>
                            </td>
                            <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
                <div className="card-header">
                  <h3 className="card-title">История платежей</h3>
                </div>

                {paymentsError && (
                  <div className="alert alert-warning">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>{paymentsError}</span>
                  </div>
                )}

                {!payments ? (
                  <div style={{ padding: '48px 24px' }}>
                    <LoadingSpinner size="small" message="Загрузка платежей..." />
                  </div>
                ) : payments.length === 0 ? (
                  <div style={{ padding: '32px 24px' }}>
                    <EmptyState
                      title="Нет платежей"
                      description="Этот пользователь ещё не совершал платежей."
                      icon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      }
                    />
                  </div>
                ) : (
                  <>
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Дата</th>
                            <th>YooKassa ID</th>
                            <th>Сумма</th>
                            <th>Статус</th>
                            <th>Описание</th>
                            <th>YooKassa URL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment) => (
                            <tr key={payment.id}>
                              <td>{new Date(payment.createdAt).toLocaleString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                              <td>
                                <code style={{ fontSize: '0.75rem', color: 'var(--gray-700)' }}>
                                  {payment.yookassaPaymentId}
                                </code>
                              </td>
                              <td style={{ fontWeight: 500 }}>
                                {payment.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {payment.currency}
                              </td>
                              <td>
                                <span className={`badge ${
                                  payment.status === 'succeeded' ? 'badge-success' :
                                  payment.status === 'pending' ? 'badge-info' :
                                  'badge-inactive'
                                }`}>
                                  {payment.status}
                                </span>
                              </td>
                              <td>{payment.description}</td>
                              <td>
                                <a
                                  href={`https://yookassa.ru/my/payments?search=${payment.yookassaPaymentId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-primary"
                                >
                                  ЮKassa
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ 
                      marginTop: 'var(--spacing-lg)', 
                      padding: 'var(--spacing-lg)', 
                      background: 'var(--gray-50)', 
                      borderRadius: 'var(--radius-md)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: 'var(--spacing-lg)'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                          Всего платежей
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--gray-900)' }}>
                          {payments.length}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                          Общая сумма
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--gray-900)' }}>
                          {payments.reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {payments[0]?.currency || 'RUB'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                          Успешно
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--success-color)' }}>
                          {payments.filter(p => p.status === 'succeeded').length}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                          В ожидании
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--info-color)' }}>
                          {payments.filter(p => p.status === 'pending').length}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Create Subscription Modal */}
        {showCreateModal && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <CreateSubscriptionForm
                userId={selectedUser.id}
                userName={selectedUser.fullName}
                onSuccess={handleSubscriptionCreated}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
