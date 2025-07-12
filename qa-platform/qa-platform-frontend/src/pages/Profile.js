import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { format } from 'date-fns';
import Spinner from '../components/Spinner';
import { User, Calendar, Star } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getProfile();
        setProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="text-center py-10"><Spinner size={48} /></div>;
  if (!profile) return <div className="text-center">Could not load profile.</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-8 border border-gray-200">
        <div className="flex flex-col sm:flex-row items-center sm:space-x-6">
          <User className="w-24 h-24 p-4 mb-4 sm:mb-0 bg-primary-100 text-primary-600 rounded-full" />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-800">{profile.username}</h1>
            <p className="text-gray-500">{profile.email}</p>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 space-y-4">
          <div className="flex items-center text-gray-700">
            <Star className="w-5 h-5 mr-3 text-yellow-500" />
            <span className="font-semibold">Reputation:</span>
            <span className="ml-2">{profile.reputation}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Calendar className="w-5 h-5 mr-3 text-gray-500" />
            <span className="font-semibold">Member since:</span>
            <span className="ml-2">{format(new Date(profile.created_at), 'MMMM d, yyyy')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;