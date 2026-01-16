
import React from 'react';
import { EditIcon, DeleteIcon, ViewIcon, DownloadIcon } from './icons';

interface TableActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onDownload?: () => void;
}

const TableActions: React.FC<TableActionsProps> = ({ onEdit, onDelete, onView, onDownload }) => {
  return (
    <div className="flex items-center space-x-2">
      {onView && (
        <button onClick={onView} className="p-1 text-gray-500 rounded hover:bg-gray-200 hover:text-gray-700" title="Voir">
          <ViewIcon className="w-5 h-5" />
        </button>
      )}
      {onDownload && (
        <button onClick={onDownload} className="p-1 text-green-600 rounded hover:bg-green-100 hover:text-green-800" title="Télécharger">
          <DownloadIcon className="w-5 h-5" />
        </button>
      )}
      {onEdit && (
        <button onClick={onEdit} className="p-1 text-blue-600 rounded hover:bg-blue-100 hover:text-blue-800" title="Modifier">
          <EditIcon className="w-5 h-5" />
        </button>
      )}
      {onDelete && (
        <button onClick={onDelete} className="p-1 text-red-600 rounded hover:bg-red-100 hover:text-red-800" title="Supprimer">
          <DeleteIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default TableActions;
