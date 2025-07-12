import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 24 }) => {
  return (
    <div className="flex justify-center items-center">
      <Loader2 className="animate-spin text-primary-600" style={{ width: size, height: size }} />
    </div>
  );
};

export default Spinner;