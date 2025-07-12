import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { questionAPI, answerAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

import Spinner from '../components/Spinner';
import VoteComponent from '../components/VoteComponent';
import MarkdownRenderer from '../components/MarkdownRenderer';
import RichTextEditor from '../components/RichTextEditor';
import { Check, User, Trash2 } from 'lucide-react'; // Import Trash2 icon

const QuestionDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth(); // 'user' object now contains the role
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQuestion = useCallback(async () => {
    try {
      setLoading(true);
      const response = await questionAPI.getQuestion(id);
      setQuestion(response.data);
    } catch (error) {
      toast.error("Question not found.");
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchQuestion();
  }, [id, fetchQuestion]);

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim() || newAnswer === '<p><br></p>') {
      toast.error("Answer cannot be empty.");
      return;
    }
    setIsSubmitting(true);
    try {
      await answerAPI.createAnswer({ questionId: id, content: newAnswer });
      setNewAnswer('');
      toast.success("Answer posted successfully!");
      fetchQuestion(); // Refetch to get the new answer
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to post answer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
        await answerAPI.acceptAnswer(answerId);
        toast.success("Answer accepted!");
        fetchQuestion(); // Refetch to update state
    } catch (error)        {
        toast.error(error.response?.data?.error || "Failed to accept answer.");
    }
  };

  // --- ADMIN ACTIONS ---
  const handleDeleteQuestion = async () => {
    if (window.confirm("ADMIN ACTION: Are you sure you want to permanently delete this question and all its answers?")) {
        try {
            await questionAPI.deleteQuestion(id); // Assumes deleteQuestion exists in your api service
            toast.success("Question deleted by admin.");
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to delete question.");
        }
    }
  }

  const handleDeleteAnswer = async (answerId) => {
    if (window.confirm("ADMIN ACTION: Are you sure you want to permanently delete this answer?")) {
        try {
            await answerAPI.deleteAnswer(answerId); // Assumes deleteAnswer exists in your api service
            toast.success("Answer deleted by admin.");
            fetchQuestion(); // Refetch to update the list of answers
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to delete answer.");
        }
    }
  }

  if (loading) return <div className="text-center py-10"><Spinner size={48} /></div>;
  if (!question) return <div className="text-center text-xl font-semibold">Question not found.</div>;

  const { answers } = question;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Question Section */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl font-bold text-gray-800 ">{question.title}</h1>
            {/* ADMIN: Delete Question Button */}
            {user?.role === 'admin' && (
                <button 
                  onClick={handleDeleteQuestion} 
                  title="Admin: Delete Question" 
                  className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                >
                    <Trash2 size={20} />
                </button>
            )}
        </div>
        <div className="text-sm text-gray-500 border-b pb-4 mb-4 flex space-x-4">
          <span>Asked: {format(new Date(question.created_at), 'MMM d, yyyy')}</span>
          <span>Viewed: {question.views} times</span>
        </div>
        <div className="flex space-x-6">
          <VoteComponent 
            voteableId={question.id} 
            voteableType="question" 
            initialScore={question.score}
            userVote={question.userVote}
          />
          <div className="prose max-w-none w-full text-gray-800">
            <MarkdownRenderer markdown={question.description} />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
            {question.tags.split(',').map((tag) => (
                <Link key={tag} to={`/?tag=${tag}`} className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-primary-200">{tag}</Link>
            ))}
        </div>
        <div className="mt-6 flex justify-end">
            <div className="bg-primary-50 p-3 rounded-md text-sm">
                <p className="text-gray-500">asked by</p>
                <div className="flex items-center space-x-2 mt-1">
                    <User className="w-8 h-8 p-1 bg-primary-200 text-primary-700 rounded-full"/>
                    <div>
                        <p className="font-semibold text-primary-700">{question.username}</p>
                        <p className="text-xs text-gray-600">Reputation: {question.reputation}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Answers Section */}
      {answers && answers.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{answers.length} Answer{answers.length > 1 && 's'}</h2>
          <div className="space-y-6">
            {answers.map(answer => (
              <div key={answer.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex space-x-6">
                 <div className="flex flex-col items-center flex-shrink-0">
                      <VoteComponent 
                          voteableId={answer.id} 
                          voteableType="answer" 
                          initialScore={answer.score}
                          userVote={answer.userVote}
                      />
                      {answer.is_accepted && (
                          <div className="mt-2 text-green-500" title="Accepted Answer">
                              <Check size={32} />
                          </div>
                      )}
                      {isAuthenticated && user?.id === question.user_id && !answer.is_accepted && (
                           <button onClick={() => handleAcceptAnswer(answer.id)} className="mt-2 p-2 rounded-full hover:bg-green-100 text-gray-400 hover:text-green-500 transition-colors" title="Accept this answer">
                               <Check size={24} />
                           </button>
                      )}
                 </div>
                <div className="w-full">
                  <div className="prose max-w-none text-gray-800">
                      <MarkdownRenderer markdown={answer.content} />
                  </div>
                  <div className="mt-6 flex justify-between items-end">
                      {/* ADMIN: Delete Answer Button */}
                      {user?.role === 'admin' ? (
                          <button onClick={() => handleDeleteAnswer(answer.id)} title="Admin: Delete Answer" className="p-2 text-red-500 hover:bg-red-100 rounded-lg text-xs flex items-center gap-1 transition-colors">
                              <Trash2 size={14} /> Delete
                          </button>
                      ) : <div></div> /* Empty div to maintain space with justify-between */}
                      
                      <div className="bg-gray-100 p-3 rounded-md text-sm">
                          <p className="text-gray-500">answered by</p>
                          <div className="flex items-center space-x-2 mt-1">
                             <User className="w-8 h-8 p-1 bg-gray-200 text-gray-700 rounded-full"/>
                             <div>
                                  <p className="font-semibold text-gray-800">{answer.username}</p>
                                  <p className="text-xs text-gray-600">Reputation: {answer.reputation}</p>
                             </div>
                          </div>
                      </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Your Answer Section */}
      {isAuthenticated ? (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Answer</h2>
          <form onSubmit={handlePostAnswer} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <RichTextEditor value={newAnswer} onChange={setNewAnswer} placeholder="Write your answer here..." />
            <button type="submit" disabled={isSubmitting} className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed">
              {isSubmitting ? 'Posting...' : 'Post Your Answer'}
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-8 border-t-2 pt-6 text-center">
            <h2 className="text-xl font-semibold">Want to answer this question?</h2>
            <p className="text-gray-600 mt-2">
                <Link to="/login" className="text-primary-600 font-medium hover:underline">Log in</Link> or <Link to="/register" className="text-primary-600 font-medium hover:underline">create an account</Link> to post your answer.
            </p>
        </div>
      )}
    </div>
  );
};

export default QuestionDetail;