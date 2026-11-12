import React from 'react';
import { useNavigate } from 'react-router-dom';
import CategorySelect from '../../components/starter-modals/CategorySelect/CategorySelect';
import ModalFrame from '../../components/starter-modals/ModalFrame';

const CategorySelectionPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCloseAndGoBack = () => {
    navigate('/'); // Go back to the main dashboard
  };

  return (
    <ModalFrame isOpen={true} onClose={handleCloseAndGoBack}>
      <CategorySelect onBack={handleCloseAndGoBack} />
    </ModalFrame>
  );
};

export default CategorySelectionPage;