import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import Spinner from './Spinner';
import { format } from 'date-fns';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await authAPI.getAllUsers();
            setUsers(response.data);
        } catch (error) {
            toast.error("Failed to fetch users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            try {
                await authAPI.updateUserRole(userId, newRole);
                toast.success("User role updated successfully.");
                fetchUsers(); // Refresh the user list
            } catch (error) {
                toast.error(error.response?.data?.error || "Failed to update role.");
            }
        }
    };

    if (loading) return <div className="text-center py-10"><Spinner size={48} /></div>;

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Panel: User Management</h1>
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reputation</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Since</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.reputation}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(user.created_at), 'MMM d, yyyy')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {user.role === 'user' ? (
                                        <button onClick={() => handleRoleChange(user.id, 'admin')} className="text-primary-600 hover:text-primary-900">Make Admin</button>
                                    ) : (
                                        <button onClick={() => handleRoleChange(user.id, 'user')} className="text-gray-500 hover:text-gray-700">Make User</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;