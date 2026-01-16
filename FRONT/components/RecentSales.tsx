import React from 'react';

// Define types to match the data structure from DashboardPage
type SaleItem = {
    productId: number;
    nom_article: string;
    quantite: number;
    prix_vente: number;
};

type Sale = {
    id: number;
    date_vente: string;
    nom_client: string;
    items: SaleItem[];
    montant_total: number;
};

interface RecentSalesProps {
    onPageChange: (page: string) => void;
    sales: Sale[];
}

const RecentSales: React.FC<RecentSalesProps> = ({ onPageChange, sales }) => {
  const recentSalesData = [...sales]
    .sort((a, b) => new Date(b.date_vente).getTime() - new Date(a.date_vente).getTime())
    .slice(0, 5); // Show top 5 recent sales

  return (
    <div className="col-span-1 p-6 bg-white rounded-xl shadow lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">Ventes récentes</h2>
        <button 
          onClick={() => onPageChange('Ventes')} 
          className="px-4 py-2 text-sm font-medium text-white bg-blue-950 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Voir Tout
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 font-medium text-gray-500">Date</th>
              <th className="py-2 font-medium text-gray-500">Client</th>
              <th className="py-2 font-medium text-gray-500">Article(s)</th>
              <th className="py-2 font-medium text-gray-500">Prix</th>
            </tr>
          </thead>
          <tbody>
            {recentSalesData.length > 0 ? recentSalesData.map((sale) => {
              const articleNames = sale.items.map(item => item.nom_article).join(', ');
              return (
                <tr key={sale.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                  <td className="py-3 px-2 text-sm text-gray-600">{sale.date_vente}</td>
                  <td className="py-3 px-2 text-sm font-medium text-gray-800">{sale.nom_client}</td>
                  <td className="py-3 px-2 text-sm text-gray-600 truncate" title={articleNames}>{articleNames}</td>
                  <td className="py-3 px-2 text-sm font-semibold text-gray-800">{sale.montant_total.toLocaleString('fr-FR')} F</td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">Aucune vente récente.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentSales;