import React from 'react';
import ProblemForm from './ProblemForm';

function AdminPanel({ mode = 'create' }) {
  return <ProblemForm mode={mode} />;
}

export default AdminPanel;