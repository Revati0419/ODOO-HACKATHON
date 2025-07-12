import React, { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { voteAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const VoteComponent = ({ voteableId, voteableType, initialScore, userVote, onVoteUpdate }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [score, setScore] = useState(initialScore);
  const [currentVote, setCurrentVote] = useState(userVote);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      toast.error('Please login to vote.');
      navigate('/login');
      return;
    }

    if (isVoting) return;

    setIsVoting(true);
    const originalVote = currentVote;
    const originalScore = score;
    
    // Optimistic UI Update
    let scoreChange = 0;
    if (currentVote === voteType) {
        // undoing vote
        scoreChange = voteType === 'up' ? -1 : 1;
        setCurrentVote(null);
    } else if (currentVote) {
        // changing vote
        scoreChange = voteType === 'up' ? 2 : -2;
        setCurrentVote(voteType);
    } else {
        // new vote
        scoreChange = voteType === 'up' ? 1 : -1;
        setCurrentVote(voteType);
    }
    setScore(prevScore => prevScore + scoreChange);
    
    try {
      const response = await voteAPI.vote({
        voteableId,
        voteableType,
        voteType
      });
      // The backend response confirms the score change, so we don't need to do much here
      // But we could update the score from the backend if we wanted to be safer
      onVoteUpdate && onVoteUpdate(response.data.scoreChange);
      
    } catch (error) {
      // Revert optimistic update on error
      setCurrentVote(originalVote);
      setScore(originalScore);
      toast.error(error.response?.data?.error || 'Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      <button
        onClick={() => handleVote('up')}
        disabled={isVoting}
        className={`p-2 rounded-full transition-colors ${
          currentVote === 'up' 
            ? 'bg-green-100 text-green-600' 
            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <ArrowUp className="w-6 h-6" />
      </button>
      
      <span className={`text-xl font-bold w-10 text-center ${
        score > 0 ? 'text-green-600' : score < 0 ? 'text-red-600' : 'text-gray-700'
      }`}>
        {score}
      </span>
      
      <button
        onClick={() => handleVote('down')}
        disabled={isVoting}
        className={`p-2 rounded-full transition-colors ${
          currentVote === 'down' 
            ? 'bg-red-100 text-red-600' 
            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <ArrowDown className="w-6 h-6" />
      </button>
    </div>
  );
};

export default VoteComponent;