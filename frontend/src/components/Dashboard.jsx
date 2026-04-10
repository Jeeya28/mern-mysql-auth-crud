import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getItems, createItem, updateItem, deleteItem, getStats } from '../api/itemApi';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add form
  const [form, setForm] = useState({ title: '', description: '', status: 'active' });
  const [formLoading, setFormLoading] = useState(false);

  // Edit state
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', status: 'active' });
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch data
  const fetchData = async () => {
  setLoading(true); // optional but clean

  try {
    // Fetch items
    try {
      const itemsRes = await getItems();
      setItems(itemsRes.data);
      setError(""); // clear old errors
    } catch (err) {
      setError('Failed to load items');
    }

    // Fetch stats (non-blocking)
    try {
      const statsRes = await getStats();
      setStats(statsRes.data);
    } catch (err) {
      console.error('Stats failed:', err);
    }

  } finally {
    setLoading(false); // ✅ ALWAYS runs
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-clear messages
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  // Add item
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setFormLoading(true);
    try {
      await createItem(form);
      setForm({ title: '', description: '', status: 'active' });
      setSuccess('Item added successfully!');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item');
    } finally {
      setFormLoading(false);
    }
  };

  // Start editing
  const startEdit = (item) => {
    setEditingItem(item.id);
    setEditForm({ title: item.title, description: item.description || '', status: item.status });
  };

  // Save edit
  const handleEdit = async (id) => {
    if (!editForm.title.trim()) { setError('Title is required'); return; }
    setEditLoading(true);
    try {
      await updateItem(id, editForm);
      setEditingItem(null);
      setSuccess('Item updated successfully!');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item');
    } finally {
      setEditLoading(false);
    }
  };

  // Update status inline
  const handleStatusChange = async (id, status) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    try {
      await updateItem(id, { title: item.title, description: item.description, status });
      setSuccess('Status updated!');
      await fetchData();
    } catch {
      setError('Failed to update status');
    }
  };

  // Delete item
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteItem(deleteId);
      setDeleteId(null);
      setSuccess('Item deleted successfully!');
      await fetchData();
    } catch (err) {
      setError('Failed to delete item');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-blue-100 text-blue-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Hello, <span className="font-medium text-gray-800">{user?.name}</span>
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1.5 rounded-md text-sm hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-4 text-sm">
            {success}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
            { label: 'Active', value: stats.active, color: 'bg-green-50 text-green-700 border-green-200' },
            { label: 'Pending', value: stats.pending, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
            { label: 'Completed', value: stats.completed, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`border rounded-lg p-4 ${color}`}>
              <p className="text-sm font-medium opacity-80">{label}</p>
              <p className="text-3xl font-bold mt-1">{value || 0}</p>
            </div>
          ))}
        </div>

        {/* Add Item Form */}
        <div className="bg-white rounded-lg shadow-sm border p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Item</h2>
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Title *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <button
              type="submit"
              disabled={formLoading}
              className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium whitespace-nowrap"
            >
              {formLoading ? 'Adding...' : '+ Add Item'}
            </button>
          </form>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">My Items</h2>
            <span className="text-sm text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''}</span>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">No items yet</p>
              <p className="text-sm">Add your first item using the form above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-5 py-3 text-left">Title</th>
                    <th className="px-5 py-3 text-left hidden md:table-cell">Description</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) =>
                    editingItem === item.id ? (
                      /* Edit Row */
                      <tr key={item.id} className="bg-blue-50">
                        <td className="px-5 py-3">
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell">
                          <input
                            type="text"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-5 py-3">
                          <select
                            value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                            className="px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none"
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(item.id)}
                              disabled={editLoading}
                              className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition disabled:opacity-50"
                            >
                              {editLoading ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-300 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      /* Normal Row */
                      <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3 font-medium text-gray-800">{item.title}</td>
                        <td className="px-5 py-3 text-gray-500 hidden md:table-cell">
                          {item.description || <span className="italic text-gray-300">—</span>}
                        </td>
                        <td className="px-5 py-3">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[item.status]}`}
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEdit(item)}
                              className="bg-yellow-400 text-white px-3 py-1 rounded text-xs hover:bg-yellow-500 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteId(item.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Item</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleteLoading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}