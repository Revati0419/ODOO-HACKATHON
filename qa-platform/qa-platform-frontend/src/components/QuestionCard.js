import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Eye, ArrowUp, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import MarkdownRenderer from './MarkdownRenderer';

const QuestionCard = ({ question }) => {
  const tags = question.tags ? question.tags.split(',') : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:border-primary-300 transition-colors duration-200 flex space-x-4">
      <div className="flex flex-col items-center space-y-1 text-center text-gray-600 w-20 flex-shrink-0">
        <div className="text-lg font-bold">{question.score}</div>
        <div className="text-xs">votes</div>
        <div className={`mt-2 text-lg font-bold ${question.has_accepted_answer ? 'text-green-600' : ''}`}>{question.answer_count}</div>
        <div className="text-xs">answers</div>
        <div className="mt-2 text-xs">{question.views} views</div>
      </div>

      <div className="flex-1">
        <Link
          to={`/questions/${question.id}`}
          className="text-xl font-semibold text-gray-900 hover:text-primary-600 line-clamp-2"
        >
          {question.title}
        </Link>
        
        <div className="mt-2 text-gray-700 text-sm line-clamp-2">
          <MarkdownRenderer markdown={question.description} />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between">
            <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                <Link
                    key={index}
                    to={`/?tag=${tag}`}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 hover:bg-primary-200"
                >
                    {tag}
                </Link>
                ))}
          </div>

          <div className="mt-2 sm:mt-0 flex items-center space-x-2 text-sm text-gray-500">
            <span>asked by</span>
            <span className="font-medium text-primary-600">{question.username}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(question.created_at))} ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;