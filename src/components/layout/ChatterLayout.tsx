import React from 'react';
import Chatter from '../chatter/Chatter';
import '../../assets/styles/layout.css';

interface ChatterLayoutProps {
  children: React.ReactNode;
  model: string;
  recordId: string;
}

const ChatterLayout: React.FC<ChatterLayoutProps> = ({ children, model, recordId }) => {
  return (
    <div className="chatter-page-layout">
      <div className="chatter-main-content">
        {children}
      </div>
      <div className="chatter-sidebar">
        <Chatter model={model} recordId={recordId} />
      </div>
    </div>
  );
};

export default ChatterLayout;
