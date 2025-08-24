import React from 'react';
import { useParams } from 'react-router-dom';

const CagnotteDetails = () => {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Détails de la Cagnotte {id}</h1>
      <p>Les détails de la cagnotte seront affichés ici.</p>
    </div>
  );
};

export default CagnotteDetails;
