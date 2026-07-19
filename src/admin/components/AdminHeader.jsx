import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminHeader = ({ title }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/admin/editsite');
    }
  };

  return (
    <div className="flex justify-between items-center w-full mb-8">
      <button onClick={handleBack} className="font-roboto text-gray-500">
        ← Back
      </button>
      <h1 className="font-roboto font-bold text-2xl">{title}</h1>
      <div style={{ width: '60px' }}></div> {/* Spacer to balance the back button */}
    </div>
  );
};

export default AdminHeader;
