import React, { useState, useEffect } from 'react';
import { tagAPI } from '../services/api';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';

const Tags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const response = await tagAPI.getPopularTags();
        setTags(response.data);
      } catch (error) {
        console.error("Failed to fetch tags", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);
  
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Tags</h1>
      <p className="text-gray-600 mb-6">A tag is a keyword or label that categorizes your question with other, similar questions.</p>
      
      <input
        type="text"
        placeholder="Filter by tag name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md mb-6 focus:ring-primary-500 focus:border-primary-500"
      />
      
      {loading ? (
        <Spinner size={48} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTags.map(tag => (
            <div key={tag.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md hover:border-primary-300 transition-all">
              <Link to={`/?tag=${tag.name}`} className="inline-block bg-primary-100 text-primary-800 font-medium text-sm px-2 py-1 rounded hover:bg-primary-200">
                {tag.name}
              </Link>
              <p className="text-gray-600 mt-2 text-sm line-clamp-3 h-16">
                {tag.description || "No description provided."}
              </p>
               <p className="text-xs text-gray-500 mt-3">{tag.question_count} questions</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tags;