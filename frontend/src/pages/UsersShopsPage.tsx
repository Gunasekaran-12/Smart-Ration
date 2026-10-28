import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  Plus,
  X,
} from 'lucide-react';
import { shopApi, userApi } from '../services';
import type { RationShop, User, Role } from '../types';
import PageContainer from '../components/PageContainer';
import StatusBadge from '../components/StatusBadge';

export const UsersShopsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shops' | 'users'>('shops');
  const [shops, setShops] = useState<RationShop[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Shop Form
  const [shopForm, setShopForm] = useState({
    shopNumber: '',
    shopName: '',
    district: 'Bengaluru Urban',
    talukBlock: 'Central Ward',
    address: '',
    contactPerson: '',
    contactPhone: '+91 98765 43210',
    isActive: true,
  });

  // User Form
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'SHOP_OPERATOR' as Role,
    shopId: 1,
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [shopsData, usersData] = await Promise.all([shopApi.getAll(), userApi.getAll()]);
      setShops(shopsData);
      setUsers(usersData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await shopApi.create(shopForm);
      setIsShopModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create shop');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userApi.create(userForm);
      setIsUserModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create user account');
    }
  };

  return (
    <PageContainer
      title="Fair Price Shops & Staff Governance"
      subtitle="Super Admin governance: Register outlets, provision operator & auditor credentials, and assign jurisdictions"
      actions={
        <div className="flex items-center gap-2">
          {activeTab === 'shops' ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setShopForm({
                  shopNumber: `FPS-${Math.floor(Math.random() * 8999 + 1000)}`,
                  shopName: '',
                  district: 'Bengaluru Urban',
                  talukBlock: 'Central Ward',
                  address: '',
                  contactPerson: '',
                  contactPhone: '+91 98765 43210',
                  isActive: true,
                });
                setIsShopModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
            >
              <Plus size={16} />
              Register New Shop
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setUserForm({
                  username: '',
                  password: '',
                  fullName: '',
                  email: '',
                  phone: '',
                  role: 'SHOP_OPERATOR',
                  shopId: shops[0]?.id || 1,
                  isActive: true,
                });
                setIsUserModalOpen(true);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/30 flex items-center gap-1.5 transition-all"
            >
              <Plus size={16} />
              Provision Account
            </motion.button>
          )}
        </div>
      }
    >
      {/* Switcher */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('shops')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'shops'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 size={16} />
          Fair Price Shops ({shops.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users size={16} />
          User Accounts ({users.length})
        </button>
      </div>

      {/* Shops Table */}
      {activeTab === 'shops' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 font-mono text-[11px]">
                  <th className="py-3.5 px-4">Shop Number</th>
                  <th className="py-3.5 px-4">Shop Name</th>
                  <th className="py-3.5 px-4">District / Taluk</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {shops.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      {s.shopNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-sans">
                      {s.shopName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-sans">
                      {s.district} &bull; {s.talukBlock}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate font-sans">
                      {s.address}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-sans">
                      {s.contactPerson} ({s.contactPhone})
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={s.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Users Table */}
      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 font-mono text-[11px]">
                  <th className="py-3.5 px-4">Username</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">System Role</th>
                  <th className="py-3.5 px-4">Assigned Shop</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4 text-center">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                      {u.username}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-sans">
                      {u.fullName}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={u.role} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-sans">
                      {u.shopName || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-sans">
                      {u.email || u.phone || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={u.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Shop Modal */}
      <AnimatePresence>
        {isShopModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs text-slate-900"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 size={18} className="text-emerald-600" />
                  <span>Register New Fair Price Shop</span>
                </h3>
                <button onClick={() => setIsShopModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateShop} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">Shop Code / Number</label>
                    <input
                      type="text"
                      required
                      value={shopForm.shopNumber}
                      onChange={(e) => setShopForm({ ...shopForm, shopNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">Shop Name</label>
                    <input
                      type="text"
                      required
                      value={shopForm.shopName}
                      onChange={(e) => setShopForm({ ...shopForm, shopName: e.target.value })}
                      placeholder="e.g. Gandhi Nagar FPS"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">District</label>
                    <input
                      type="text"
                      required
                      value={shopForm.district}
                      onChange={(e) => setShopForm({ ...shopForm, district: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">Taluk / Block</label>
                    <input
                      type="text"
                      required
                      value={shopForm.talukBlock}
                      onChange={(e) => setShopForm({ ...shopForm, talukBlock: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Physical Address</label>
                  <textarea
                    rows={2}
                    required
                    value={shopForm.address}
                    onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-emerald-500 font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">Operator In-Charge</label>
                    <input
                      type="text"
                      value={shopForm.contactPerson}
                      onChange={(e) => setShopForm({ ...shopForm, contactPerson: e.target.value })}
                      placeholder="Person name"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-emerald-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">Phone Helpline</label>
                    <input
                      type="text"
                      value={shopForm.contactPhone}
                      onChange={(e) => setShopForm({ ...shopForm, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => setIsShopModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30"
                  >
                    Create Shop
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Modal */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs text-slate-900"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users size={18} className="text-amber-500" />
                  <span>Provision User Account</span>
                </h3>
                <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">Username</label>
                    <input
                      type="text"
                      required
                      value={userForm.username}
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                      placeholder="e.g. operator_blrw"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-mono text-slate-900 focus:bg-white focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">Password</label>
                    <input
                      type="password"
                      required
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder="Secure password"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userForm.fullName}
                    onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-emerald-500 font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">Role</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value as Role })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:border-emerald-500 font-sans"
                    >
                      <option value="SHOP_OPERATOR">Ration Shop Operator</option>
                      <option value="AUDITOR">Auditor / Quality Inspector</option>
                      <option value="SUPER_ADMIN">Super Admin / Department Officer</option>
                    </select>
                  </div>

                  {userForm.role === 'SHOP_OPERATOR' && (
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">Assigned Shop</label>
                      <select
                        value={userForm.shopId}
                        onChange={(e) => setUserForm({ ...userForm, shopId: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:border-emerald-500 font-sans"
                      >
                        {shops.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.shopName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => setIsUserModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md shadow-amber-500/30"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default UsersShopsPage;
