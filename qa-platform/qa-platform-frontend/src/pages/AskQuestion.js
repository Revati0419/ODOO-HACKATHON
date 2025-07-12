import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionAPI } from '../services/api';
import RichTextEditor from '../components/RichTextEditor';
import TagSelector from '../components/TagSelector';
import toast from 'react-hot-toast';

const AskQuestion = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      return toast.error('Title is required.');
    }
    if (!description.trim() || description === '<p><br></p>') {
      return toast.error('Description cannot be empty.');
    }
    if (tags.length === 0) {
      return toast.error('Please add at least one tag.');
    }
    setLoading(true);
    try {
      const response = await questionAPI.createQuestion({ title, description, tags });
      toast.success('Question posted successfully!');
      navigate(`/questions/${response.data.id}`);
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.error || 'Failed to post question.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Ask a Public Question</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md border border-gray-200 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">Title</label>
          <p className="text-xs text-gray-500 mb-2">Be specific and imagine you’re asking a question to another person.</p>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How to center a div in CSS?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
          <p className="text-xs text-gray-500 mb-2">Include all the information someone would need to answer your question.</p>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Describe your problem..."
          />
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-bold text-gray-700 mb-2">Tags</label>
          <p className="text-xs text-gray-500 mb-2">Add up to 5 tags to describe what your question is about.</p>
          <TagSelector
            value={tags}
            onChange={setTags}
          />
        </div>
        <div>
          <button type="submit" disabled={loading} className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed">
            {loading ? 'Posting...' : 'Post Your Question'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AskQuestion;