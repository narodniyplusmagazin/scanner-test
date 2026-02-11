/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import type { MySubscription } from '../types/subscription.types';
import type { User } from '../types/user.types';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import './Admin.css';

interface SubscriptionWithUser extends MySubscription {
  user?: User;
}

export default function AllSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    setError(null);
    setLoading(true);

    axios.get<SubscriptionWithUser[]>(`${API_BASE_URL}/subscriptions/getAll`)
      .then(response => {
        if (mounted) {
          setSubscriptions(response.data);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(
            err.response?.data?.message ||
            err.message ||
            'Failed to fetch subscriptions'
          );
          setSubscriptions([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const getStatusBadgeClass = (isActive: boolean) => {
    return isActive ? 'badge badge-success' : 'badge badge-inactive';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  };

  const filteredSubscriptions = subscriptions?.filter(sub => {
    // Filter by status
    if (filterStatus === 'active' && !sub.isActive) return false;
    if (filterStatus === 'inactive' && sub.isActive) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        sub.user?.fullName.toLowerCase().includes(query) ||
        sub.user?.email?.toLowerCase().includes(query) ||
        sub.user?.phone?.toLowerCase().includes(query) ||
        sub.plan?.name.toLowerCase().includes(query) ||
        sub.id.toLowerCase().includes(query)
      );
    }

    return true;
  }) || [];

  const activeCount = subscriptions?.filter(s => s.isActive).length || 0;
  const inactiveCount = subscriptions?.filter(s => !s.isActive).length || 0;
  const expiringCount = subscriptions?.filter(s => s.isActive && isExpiringSoon(s.endDate)).length || 0;

  return (
    <Layout title="All Subscriptions">
      <div className="admin-container">
        {/* Statistics Cards */}
        {subscriptions && subscriptions.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 'var(--spacing-lg)',
            marginBottom: 'var(--spacing-xl)'
          }}>
            <div className="card">
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                Total Subscriptions
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--gray-900)' }}>
                {subscriptions.length}
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                Active
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--success-color)' }}>
                {activeCount}
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                Inactive
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--gray-400)' }}>
                {inactiveCount}
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                Expiring Soon
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--warning-color)' }}>
                {expiringCount}
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label htmlFor="search" style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--gray-700)', fontSize: '0.875rem', fontWeight: 500 }}>
                Search
              </label>
              <input
                id="search"
                type="text"
                className="form-input"
                placeholder="Search by user, email, plan name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--gray-700)', fontSize: '0.875rem', fontWeight: 500 }}>
                Filter by Status
              </label>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`btn btn-sm ${filterStatus === 'active' ? 'btn-success' : 'btn-secondary'}`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterStatus('inactive')}
                  className={`btn btn-sm ${filterStatus === 'inactive' ? 'btn-secondary' : 'btn-secondary'}`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && !loading && (
          <ErrorMessage message={error} />
        )}

        {/* Loading State */}
        {loading && (
          <LoadingSpinner size="large" />
        )}

        {/* Empty State */}
        {!loading && subscriptions && subscriptions.length === 0 && (
          <EmptyState 
            title="No subscriptions found"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            }
          />
        )}

        {/* Subscriptions Table */}
        {!loading && filteredSubscriptions.length > 0 && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <h2>
                Subscription List
                <span style={{ marginLeft: 'var(--spacing-sm)', color: 'var(--gray-500)', fontWeight: 'normal', fontSize: '1rem' }}>
                  ({filteredSubscriptions.length} {filteredSubscriptions.length === 1 ? 'subscription' : 'subscriptions'})
                </span>
              </h2>
            </div>
            
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Plan</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((subscription) => {
                    const daysSinceStart = Math.floor((new Date().getTime() - new Date(subscription.startDate).getTime()) / (1000 * 60 * 60 * 24));
                    const daysTotal = Math.floor((new Date(subscription.endDate).getTime() - new Date(subscription.startDate).getTime()) / (1000 * 60 * 60 * 24));
                    const daysRemaining = Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const expiringSoon = isExpiringSoon(subscription.endDate);

                    return (
                      <tr key={subscription.id}>
                        <td>
                          <div>
                            <div style={{ fontWeight: 500 }}>
                              {subscription.user?.fullName || 'Unknown User'}
                            </div>
                            {subscription.user?.email && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                                {subscription.user.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>
                            {subscription.plan?.name || 'N/A'}
                          </div>
                          {subscription.plan?.price && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                              {subscription.plan.price.toLocaleString('ru-RU')} RUB
                            </div>
                          )}
                        </td>
                        <td>{formatDate(subscription.startDate)}</td>
                        <td>
                          <div>
                            {formatDate(subscription.endDate)}
                            {expiringSoon && subscription.isActive && (
                              <div>
                                <span className="badge badge-info" style={{ fontSize: '0.7rem', marginTop: '4px' }}>
                                  {daysRemaining} days left
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.875rem' }}>
                            {subscription.isActive ? `${daysSinceStart}/${daysTotal} days` : `${daysTotal} days`}
                          </div>
                          {subscription.isActive && (
                            <div style={{ width: '100%', height: '4px', background: 'var(--gray-200)', borderRadius: '2px', marginTop: '4px' }}>
                              <div 
                                style={{ 
                                  width: `${Math.min((daysSinceStart / daysTotal) * 100, 100)}%`, 
                                  height: '100%', 
                                  background: expiringSoon ? 'var(--warning-color)' : 'var(--primary-color)', 
                                  borderRadius: '2px',
                                  transition: 'width 0.3s ease'
                                }}
                              />
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(subscription.isActive)}>
                            {subscription.isActive ? '● Active' : '○ Inactive'}
                          </span>
                        </td>
                        <td>{formatDate(subscription.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && subscriptions && subscriptions.length > 0 && filteredSubscriptions.length === 0 && (
          <EmptyState 
            title="No subscriptions match your filters"
            description="Try adjusting your search or filter criteria"
          />
        )}
      </div>
    </Layout>
  );
}
