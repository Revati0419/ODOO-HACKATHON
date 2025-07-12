import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { questionAPI } from '../services/api';
import QuestionCard from '../components/QuestionCard';
import Spinner from '../components/Spinner';

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const tag = searchParams.get('tag');
  const search = searchParams.get('search');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const params = {
          page: 1,
          limit: 20,
          tag: tag || undefined,
          search: search || undefined,
        };
        const response = await questionAPI.getQuestions(params);
        setQuestions(response.data);
      } catch (error) {
        console.error("Failed to fetch questions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [tag, search]);

  const getPageTitle = () => {
    if (search) return `Search Results for "${search}"`;
    if (tag) return `Questions tagged [${tag}]`;
    return 'All Questions';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{getPageTitle()}</h1>
        <Link to="/ask" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
          Ask Question
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <Spinner size={48} />
        </div>
      ) : (
        <div className="space-y-4">
          {questions.length > 0 ? (
            questions.map(question => (
              <QuestionCard key={question.id} question={question} />
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border">
              <h2 className="text-xl font-semibold text-gray-700">No questions found.</h2>
              <p className="text-gray-500 mt-2">Why not be the first to ask a question?</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;