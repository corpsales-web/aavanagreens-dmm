import React from 'react';

export default function NoAccess({ title = 'No Access', message = 'You do not have permission to view this section.' }) {
  return (
    <div className="panel">
      <div className="panel-title">{title}</div>
      <div className="panel-body">
        <div className="text-sm text-gray-600">{message}</div>
      </div>
    </div>
  );
}