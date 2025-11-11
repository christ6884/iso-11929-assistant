import React from 'react';
import Card from '../Card';
import { sourceTypes } from '../../services/sourceTypes';

interface SourceTypesMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: any;
}

const SourceTypesMemoModal: React.FC<SourceTypesMemoModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-4xl p-4" onClick={(e) => e.stopPropagation()}>
        <Card title={t('sourceTypeMemoTitle')}>
          <div className="max-h-[70vh] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-400 bg-gray-900/50 sticky top-0">
                <tr>
                  <th className="py-2 px-3">{t('typeKey')}</th>
                  <th className="py-2 px-3">{t('description')}</th>
                  <th className="py-2 px-3">{t('sourceMgmt_nuclide')}</th>
                  <th className="py-2 px-3 text-right">{t('minActivity')}</th>
                  <th className="py-2 px-3 text-right">{t('maxActivity')}</th>
                </tr>
              </thead>
              <tbody className="text-gray-200">
                {sourceTypes.map(type => (
                  <tr key={type.key} className="border-t border-gray-700">
                    <td className="py-3 px-3 font-bold text-cyan-300">{type.key}</td>
                    <td className="py-3 px-3">{type.description}</td>
                    <td className="py-3 px-3">{type.nuclide}</td>
                    <td className="py-3 px-3 font-mono text-right">{type.minActivityBq.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono text-right">{type.maxActivityBq.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end pt-4 mt-4 border-t border-gray-700">
            <button onClick={onClose} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
              {t('close')}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SourceTypesMemoModal;