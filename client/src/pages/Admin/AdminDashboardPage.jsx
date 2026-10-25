import React, { useState, useEffect, useMemo } from 'react';
import {
  getAllUsersAdmin,
  getAllOrdersAdmin,
  toggleUserStatusAdmin,
  toggleRestaurantActivationAdmin,
} from '../../services/order.service';
import { getRestaurants, toggleRestaurantStatus } from '../../services/restaurant.service';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  Users,
  Utensils,
  Package,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChefHat,
  Bike,
  UserCheck,
  Ban,
  CheckCircle,
  Power,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ROLE_PRIORITY = {
  Restaurant: 1,
  Rider: 2,
  Customer: 3,
};

export default function AdminDashboardPage() {
  const [tab, setTab] = useState('users'); // 'users' | 'kitchens' | 'orders'
  const [users, setUsers] = useState([]);
  const [kitchens, setKitchens] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // User tab controls
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'Restaurant' | 'Rider' | 'Customer'
  const [userStatusFilter, setUserStatusFilter] = useState('all'); // 'all' | 'active' | 'deactivated'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc': Restaurant -> Rider -> Customer; 'desc': Customer -> Rider -> Restaurant

  // Kitchen tab controls
  const [kitchenStatusFilter, setKitchenStatusFilter] = useState('all'); // 'all' | 'active' | 'deactivated'
  const [kitchenSearch, setKitchenSearch] = useState('');

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (tab === 'users') {
        const data = await getAllUsersAdmin();
        const rawUsers = data?.users || [];
        // Strictly exclude any admin users
        const nonAdmins = rawUsers.filter((u) => u.userType !== 'Admin');
        setUsers(nonAdmins);
      } else if (tab === 'kitchens') {
        const data = await getRestaurants();
        setKitchens(data?.restaurants || []);
      } else if (tab === 'orders') {
        const data = await getAllOrdersAdmin();
        setOrders(data?.orders || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  // Toggle user activation
  const handleToggleUserStatus = async (targetUser) => {
    const isCurrentlyActive = targetUser.isActive !== false;
    const newStatus = !isCurrentlyActive;
    const actionLabel = newStatus ? 'activate' : 'deactivate';

    try {
      setActionLoadingId(`user-${targetUser._id}`);
      const res = await toggleUserStatusAdmin(targetUser._id, newStatus);
      toast.success(res?.message || `User successfully ${actionLabel}d`);

      // Update local users state
      setUsers((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, isActive: newStatus } : u))
      );

      // If deactivating a restaurant chef, reflect on kitchens too
      if (targetUser.userType === 'Restaurant' && !newStatus) {
        setKitchens((prev) =>
          prev.map((k) =>
            k.owner?._id === targetUser._id || k.owner === targetUser._id
              ? { ...k, isActive: false, isOpen: false }
              : k
          )
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${actionLabel} user`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle kitchen platform activation
  const handleToggleKitchenActivation = async (kitchen) => {
    const isCurrentlyActive = kitchen.isActive !== false;
    const newStatus = !isCurrentlyActive;
    const actionLabel = newStatus ? 'activate' : 'deactivate';

    try {
      setActionLoadingId(`kitchen-activation-${kitchen._id}`);
      const res = await toggleRestaurantActivationAdmin(kitchen._id, newStatus);
      toast.success(res?.message || `Kitchen "${kitchen.name}" ${actionLabel}d`);

      setKitchens((prev) =>
        prev.map((k) =>
          k._id === kitchen._id
            ? { ...k, isActive: newStatus, isOpen: newStatus ? k.isOpen : false }
            : k
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${actionLabel} kitchen`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle kitchen open/closed status (Admin authority)
  const handleToggleKitchenOpen = async (kitchen) => {
    if (kitchen.isActive === false) {
      toast.error('Cannot open a deactivated kitchen. Please activate it first.');
      return;
    }

    try {
      setActionLoadingId(`kitchen-open-${kitchen._id}`);
      const res = await toggleRestaurantStatus(kitchen._id);
      toast.success(res?.message || 'Kitchen open status updated');

      setKitchens((prev) =>
        prev.map((k) => (k._id === kitchen._id ? { ...k, isOpen: !k.isOpen } : k))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update kitchen open status');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Role count metrics (excluding Admin)
  const roleCounts = useMemo(() => {
    const list = users.filter((u) => u.userType !== 'Admin');
    return {
      all: list.length,
      Restaurant: list.filter((u) => u.userType === 'Restaurant').length,
      Rider: list.filter((u) => u.userType === 'Rider').length,
      Customer: list.filter((u) => u.userType === 'Customer').length,
      active: list.filter((u) => u.isActive !== false).length,
      deactivated: list.filter((u) => u.isActive === false).length,
    };
  }, [users]);

  // Filtered and sorted users
  const sortedAndFilteredUsers = useMemo(() => {
    return users
      .filter((u) => u.userType !== 'Admin')
      .filter((u) => (roleFilter === 'all' ? true : u.userType === roleFilter))
      .filter((u) => {
        if (userStatusFilter === 'active') return u.isActive !== false;
        if (userStatusFilter === 'deactivated') return u.isActive === false;
        return true;
      })
      .filter((u) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          u.fullName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const orderA = ROLE_PRIORITY[a.userType] ?? 99;
        const orderB = ROLE_PRIORITY[b.userType] ?? 99;
        if (orderA !== orderB) {
          return sortOrder === 'asc' ? orderA - orderB : orderB - orderA;
        }
        return (a.fullName || '').localeCompare(b.fullName || '');
      });
  }, [users, roleFilter, userStatusFilter, searchQuery, sortOrder]);

  // Filtered kitchens
  const filteredKitchens = useMemo(() => {
    return kitchens
      .filter((k) => {
        if (kitchenStatusFilter === 'active') return k.isActive !== false;
        if (kitchenStatusFilter === 'deactivated') return k.isActive === false;
        return true;
      })
      .filter((k) => {
        if (!kitchenSearch.trim()) return true;
        const q = kitchenSearch.toLowerCase();
        return (
          k.name?.toLowerCase().includes(q) ||
          k.address?.toLowerCase().includes(q) ||
          k.owner?.fullName?.toLowerCase().includes(q) ||
          k.owner?.email?.toLowerCase().includes(q)
        );
      });
  }, [kitchens, kitchenStatusFilter, kitchenSearch]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Restaurant':
        return 'border-amber-500/80 bg-amber-500/10 text-amber-700 dark:text-amber-400';
      case 'Rider':
        return 'border-blue-500/80 bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'Customer':
        return 'border-emerald-500/80 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
      default:
        return 'border-on-background bg-surface-container-high text-on-surface';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Restaurant':
        return <ChefHat size={12} className="inline mr-1" />;
      case 'Rider':
        return <Bike size={12} className="inline mr-1" />;
      case 'Customer':
        return <UserCheck size={12} className="inline mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background py-10 px-4 sm:px-6 lg:px-12 max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-primary" />
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
            Root Authority Console
          </span>
        </div>
        <h1 className="font-headline font-black text-3xl sm:text-4xl mt-1 tracking-tight">
          Platform Administration<span className="text-primary">.</span>
        </h1>
        <p className="font-body text-secondary mt-1 text-sm">
          Complete authority to inspect, activate, and deactivate platform accounts, kitchens, and live orders.
        </p>

        {/* Tab Switcher */}
        <div className="flex gap-4 mt-6 border-b-2 border-on-background pb-2 font-mono text-xs uppercase font-bold overflow-x-auto">
          <button
            onClick={() => setTab('users')}
            className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'users'
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-on-background'
            }`}
          >
            <Users size={14} /> Registered Users ({roleCounts.all})
          </button>
          <button
            onClick={() => setTab('kitchens')}
            className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'kitchens'
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-on-background'
            }`}
          >
            <Utensils size={14} /> Kitchens ({kitchens.length})
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'orders'
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-on-background'
            }`}
          >
            <Package size={14} /> All Orders ({orders.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24 font-mono text-xs uppercase text-secondary">
          Loading platform records...
        </div>
      ) : tab === 'users' ? (
        /* ================= USERS TAB ================= */
        <div className="space-y-4">
          {/* Controls: Search, Role Filters, Status Filters */}
          <div className="bg-surface-container-lowest border-2 border-on-background p-4 ticket-shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Role Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-secondary font-bold uppercase mr-1">
                  Role:
                </span>
                <button
                  onClick={() => setRoleFilter('all')}
                  className={`font-mono text-xs uppercase font-bold px-3 py-1 border transition-all ${
                    roleFilter === 'all'
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-on-background/40 hover:border-on-background bg-surface-container-low'
                  }`}
                >
                  All ({roleCounts.all})
                </button>
                <button
                  onClick={() => setRoleFilter('Restaurant')}
                  className={`font-mono text-xs uppercase font-bold px-3 py-1 border transition-all flex items-center gap-1 ${
                    roleFilter === 'Restaurant'
                      ? 'border-amber-600 bg-amber-500/20 text-amber-700 dark:text-amber-300 font-black'
                      : 'border-on-background/40 hover:border-on-background bg-surface-container-low'
                  }`}
                >
                  <ChefHat size={12} /> Restaurant ({roleCounts.Restaurant})
                </button>
                <button
                  onClick={() => setRoleFilter('Rider')}
                  className={`font-mono text-xs uppercase font-bold px-3 py-1 border transition-all flex items-center gap-1 ${
                    roleFilter === 'Rider'
                      ? 'border-blue-600 bg-blue-500/20 text-blue-700 dark:text-blue-300 font-black'
                      : 'border-on-background/40 hover:border-on-background bg-surface-container-low'
                  }`}
                >
                  <Bike size={12} /> Rider ({roleCounts.Rider})
                </button>
                <button
                  onClick={() => setRoleFilter('Customer')}
                  className={`font-mono text-xs uppercase font-bold px-3 py-1 border transition-all flex items-center gap-1 ${
                    roleFilter === 'Customer'
                      ? 'border-emerald-600 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-black'
                      : 'border-on-background/40 hover:border-on-background bg-surface-container-low'
                  }`}
                >
                  <UserCheck size={12} /> Customer ({roleCounts.Customer})
                </button>
              </div>

              {/* Search Input & Sort Info */}
              <div className="flex items-center gap-3">
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    placeholder="Search name, email, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-on-background px-3 py-1.5 pl-8 font-mono text-xs focus:outline-none focus:border-primary"
                  />
                  <Search size={14} className="absolute left-2.5 top-2.5 text-secondary" />
                </div>

                <button
                  onClick={toggleSortOrder}
                  title="Toggle role sort order"
                  className="font-mono text-xs uppercase border border-on-background px-3 py-1.5 flex items-center gap-1 bg-surface-container-low hover:bg-surface-container-high transition-colors whitespace-nowrap font-bold"
                >
                  <ArrowUpDown size={13} className="text-primary" />
                  <span>Sort: {sortOrder === 'asc' ? 'Rest → Cust' : 'Cust → Rest'}</span>
                </button>
              </div>
            </div>

            {/* Status Filter Bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-dashed border-outline-variant text-xs font-mono">
              <span className="text-secondary font-bold uppercase mr-1">Status:</span>
              <button
                onClick={() => setUserStatusFilter('all')}
                className={`px-2.5 py-0.5 border uppercase font-bold text-[11px] ${
                  userStatusFilter === 'all'
                    ? 'border-on-background bg-on-background text-background'
                    : 'border-outline-variant hover:border-on-background bg-surface-container-low'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setUserStatusFilter('active')}
                className={`px-2.5 py-0.5 border uppercase font-bold text-[11px] flex items-center gap-1 ${
                  userStatusFilter === 'active'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-outline-variant hover:border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-surface-container-low'
                }`}
              >
                ● Active Only ({roleCounts.active})
              </button>
              <button
                onClick={() => setUserStatusFilter('deactivated')}
                className={`px-2.5 py-0.5 border uppercase font-bold text-[11px] flex items-center gap-1 ${
                  userStatusFilter === 'deactivated'
                    ? 'border-red-600 bg-red-600 text-white'
                    : 'border-outline-variant hover:border-red-600 text-red-700 dark:text-red-400 bg-surface-container-low'
                }`}
              >
                ✕ Deactivated Only ({roleCounts.deactivated})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-surface-container-lowest border-2 border-on-background p-6 ticket-shadow overflow-x-auto">
            {sortedAndFilteredUsers.length === 0 ? (
              <div className="text-center py-12 font-mono text-xs text-secondary uppercase">
                No registered users found matching the selected criteria.
              </div>
            ) : (
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-on-background text-secondary uppercase">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Phone</th>
                    <th
                      className="pb-3 cursor-pointer select-none group"
                      onClick={toggleSortOrder}
                      title="Click to sort by role"
                    >
                      <div className="flex items-center gap-1 text-on-background group-hover:text-primary transition-colors">
                        <span>Role</span>
                        {sortOrder === 'asc' ? (
                          <ArrowUp size={12} className="text-primary" />
                        ) : (
                          <ArrowDown size={12} className="text-primary" />
                        )}
                      </div>
                    </th>
                    <th className="pb-3">Account Status</th>
                    <th className="pb-3">Registered On</th>
                    <th className="pb-3 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {sortedAndFilteredUsers.map((u) => {
                    const isActive = u.isActive !== false;
                    const isBusy = actionLoadingId === `user-${u._id}`;

                    return (
                      <tr
                        key={u._id}
                        className={`transition-colors ${
                          !isActive ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-surface-container-low'
                        }`}
                      >
                        <td className="py-3 font-headline font-bold text-sm text-on-surface">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold ${
                                isActive
                                  ? 'bg-surface-container-high border-on-background'
                                  : 'bg-red-200 border-red-500 text-red-900'
                              }`}
                            >
                              {u.fullName?.charAt(0).toUpperCase() || 'U'}
                            </span>
                            <span className={!isActive ? 'line-through text-secondary' : ''}>
                              {u.fullName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-secondary">{u.email}</td>
                        <td className="py-3 text-secondary">{u.phone}</td>
                        <td className="py-3">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`border px-2.5 py-0.5 font-bold uppercase text-[10px] inline-flex items-center ${getRoleBadgeStyle(
                                u.userType
                              )}`}
                            >
                              {getRoleIcon(u.userType)}
                              {u.userType}
                            </span>
                            {u.userType === 'Rider' && (
                              <span
                                className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 border ${
                                  u.isAvailable !== false
                                    ? 'border-green-600 text-green-700 dark:text-green-300 bg-green-500/10'
                                    : 'border-outline text-secondary bg-surface-container-high'
                                }`}
                              >
                                {u.isAvailable !== false ? '● Open to Delivery' : '○ Closed (Offline)'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 border border-emerald-600 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 font-bold uppercase text-[10px]">
                              <CheckCircle size={10} /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 border border-red-600 bg-red-500/15 text-red-700 dark:text-red-300 px-2 py-0.5 font-bold uppercase text-[10px]">
                              <Ban size={10} /> Deactivated
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-secondary">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            disabled={isBusy}
                            onClick={() => handleToggleUserStatus(u)}
                            className={`border font-mono text-[11px] font-bold uppercase px-3 py-1 transition-all ${
                              isActive
                                ? 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white'
                                : 'border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                            } disabled:opacity-50`}
                          >
                            {isBusy ? 'Saving...' : isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : tab === 'kitchens' ? (
        /* ================= KITCHENS TAB ================= */
        <div className="space-y-4">
          {/* Controls: Search & Kitchen Status Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest border-2 border-on-background p-4 ticket-shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-secondary font-bold uppercase mr-1">
                Filter Kitchens:
              </span>
              <button
                onClick={() => setKitchenStatusFilter('all')}
                className={`font-mono text-xs uppercase font-bold px-3 py-1 border transition-all ${
                  kitchenStatusFilter === 'all'
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-on-background/40 hover:border-on-background bg-surface-container-low'
                }`}
              >
                All ({kitchens.length})
              </button>
              <button
                onClick={() => setKitchenStatusFilter('active')}
                className={`font-mono text-xs uppercase font-bold px-3 py-1 border transition-all ${
                  kitchenStatusFilter === 'active'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-on-background/40 hover:border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-surface-container-low'
                }`}
              >
                ● Active ({kitchens.filter((k) => k.isActive !== false).length})
              </button>
              <button
                onClick={() => setKitchenStatusFilter('deactivated')}
                className={`font-mono text-xs uppercase font-bold px-3 py-1 border transition-all ${
                  kitchenStatusFilter === 'deactivated'
                    ? 'border-red-600 bg-red-600 text-white'
                    : 'border-on-background/40 hover:border-red-600 text-red-700 dark:text-red-400 bg-surface-container-low'
                }`}
              >
                ✕ Deactivated ({kitchens.filter((k) => k.isActive === false).length})
              </button>
            </div>

            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search kitchen or owner..."
                value={kitchenSearch}
                onChange={(e) => setKitchenSearch(e.target.value)}
                className="w-full bg-surface-container-lowest border border-on-background px-3 py-1.5 pl-8 font-mono text-xs focus:outline-none focus:border-primary"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-secondary" />
            </div>
          </div>

          {/* Kitchens Grid */}
          {filteredKitchens.length === 0 ? (
            <div className="bg-surface-container-lowest border-2 border-on-background p-12 text-center ticket-shadow font-mono text-xs text-secondary uppercase">
              No kitchens found matching your filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredKitchens.map((k) => {
                const isPlatformActive = k.isActive !== false;
                const isActivationBusy = actionLoadingId === `kitchen-activation-${k._id}`;
                const isOpenBusy = actionLoadingId === `kitchen-open-${k._id}`;

                return (
                  <div
                    key={k._id}
                    className={`bg-surface-container-lowest border p-6 ticket-shadow-sm flex flex-col justify-between transition-all ${
                      !isPlatformActive
                        ? 'border-red-500 bg-red-500/[0.03] opacity-90'
                        : 'border-on-background'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-mono text-[10px] uppercase font-bold text-primary">
                          ID: {k._id.slice(-6).toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {/* Platform Activation Status */}
                          <span
                            className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 border ${
                              isPlatformActive
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-600'
                                : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-600'
                            }`}
                          >
                            {isPlatformActive ? '● ACTIVE' : '✕ DEACTIVATED'}
                          </span>

                          {/* Open / Closed Status */}
                          <span
                            className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 border ${
                              k.isOpen && isPlatformActive
                                ? 'bg-green-700 text-white border-green-800'
                                : 'bg-surface-container-high border-on-background/40 text-secondary'
                            }`}
                          >
                            {k.isOpen && isPlatformActive ? 'OPEN' : 'CLOSED'}
                          </span>
                        </div>
                      </div>

                      {/* Kitchen Name & Address */}
                      <h3
                        className={`font-headline font-bold text-xl mt-2 ${
                          !isPlatformActive ? 'line-through text-secondary' : 'text-on-surface'
                        }`}
                      >
                        {k.name}
                      </h3>
                      <p className="font-mono text-xs text-secondary mt-1">{k.address}</p>

                      {/* Deactivation Banner */}
                      {!isPlatformActive && (
                        <div className="mt-3 bg-red-500/10 border border-red-600/30 text-red-700 dark:text-red-300 p-2 text-[11px] font-mono flex items-start gap-1.5">
                          <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-600" />
                          <span>Deactivated by Admin. Customers cannot place orders to this kitchen.</span>
                        </div>
                      )}

                      {/* Cuisines */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {k.cuisine?.map((c, i) => (
                          <span
                            key={i}
                            className="font-mono text-[10px] uppercase px-1.5 py-0.5 bg-surface-container-high border border-outline-variant text-secondary"
                          >
                            {c}
                          </span>
                        ))}
                      </div>

                      {/* Owner Info */}
                      <p className="font-body text-xs text-on-surface-variant mt-3 pt-2 border-t border-dashed border-outline-variant">
                        <strong>Chef/Owner:</strong> {k.owner?.fullName || 'N/A'} (
                        {k.owner?.email || 'N/A'})
                      </p>
                    </div>

                    {/* Actions Footer */}
                    <div className="mt-6 pt-4 border-t border-on-background/20 space-y-2">
                      <div className="flex items-center gap-2">
                        {/* Toggle Platform Activation */}
                        <button
                          disabled={isActivationBusy}
                          onClick={() => handleToggleKitchenActivation(k)}
                          className={`flex-1 font-mono text-xs uppercase font-bold px-3 py-1.5 border transition-all ${
                            isPlatformActive
                              ? 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white'
                              : 'border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                          } disabled:opacity-50`}
                        >
                          {isActivationBusy
                            ? 'Processing...'
                            : isPlatformActive
                            ? 'Deactivate Kitchen'
                            : 'Activate Kitchen'}
                        </button>

                        {/* Toggle Open/Closed */}
                        <button
                          disabled={isOpenBusy || !isPlatformActive}
                          onClick={() => handleToggleKitchenOpen(k)}
                          title={!isPlatformActive ? 'Cannot open deactivated kitchen' : ''}
                          className="font-mono text-xs uppercase font-bold px-3 py-1.5 border border-on-background bg-surface-container-low hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {isOpenBusy ? '...' : k.isOpen ? 'Close' : 'Open'}
                        </button>
                      </div>

                      <div className="flex justify-end">
                        <Link
                          to={`/restaurants/${k._id}`}
                          className="font-mono text-xs uppercase text-primary font-bold hover:underline"
                        >
                          View Menu →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ================= ORDERS TAB ================= */
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord._id}
              className="bg-surface-container-lowest border border-on-background p-6 ticket-shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary border border-primary px-2 py-0.5">
                    #{ord._id.slice(-4).toUpperCase()}
                  </span>
                  <span className="font-mono text-xs text-secondary">
                    {new Date(ord.createdAt).toLocaleString()}
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 border border-on-background bg-surface-container-high">
                    {ord.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="font-headline font-bold text-lg text-on-surface mt-1">
                  {ord.restaurant?.name || 'Kitchen'} → {ord.customer?.fullName || 'Customer'}
                </h3>
                <p className="font-body text-xs text-secondary">
                  Items: {ord.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono text-lg font-black text-primary">
                  ₹{ord.totalAmount}
                </span>
                <Link
                  to={`/receipt/${ord._id}`}
                  className="border border-on-background px-3 py-1 font-mono text-xs uppercase font-bold hover:bg-surface-container-high"
                >
                  Inspect KOT
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
