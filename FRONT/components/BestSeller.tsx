
import React, { useState, useEffect } from 'react';
import { ProductIcon } from './icons';

type Product = {
    id: number;
    nom_article: string;
    prix_vente: number;
};

type SaleItem = {
    productId: number;
    quantite: number;
    prix_vente: number;
};

type Sale = {
    id: number;
    items: SaleItem[];
};


type BestSellerProduct = {
    id: number;
    nom_article: string;
    totalQuantity: number;
    totalRevenue: number;
};

interface BestSellerProps {
    products: Product[];
    sales: Sale[];
}

const BestSeller: React.FC<BestSellerProps> = ({ products, sales }) => {
    const [bestSellers, setBestSellers] = useState<BestSellerProduct[]>([]);

    useEffect(() => {
        const salesByProduct = new Map<number, { totalQuantity: number; totalRevenue: number }>();

        sales.forEach(sale => {
            sale.items.forEach(item => {
                const existing = salesByProduct.get(item.productId) || { totalQuantity: 0, totalRevenue: 0 };
                existing.totalQuantity += item.quantite;
                existing.totalRevenue += item.quantite * item.prix_vente;
                salesByProduct.set(item.productId, existing);
            });
        });

        const sortedProducts = Array.from(salesByProduct.entries())
            .map(([productId, data]) => {
                const productDetails = products.find(p => p.id === productId);
                return {
                    id: productId,
                    nom_article: productDetails?.nom_article || 'Produit inconnu',
                    ...data
                };
            })
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, 5); // Display top 5

        setBestSellers(sortedProducts);
    }, [products, sales]);


    return (
        <div className="col-span-1 p-6 bg-white rounded-xl shadow">
            <h2 className="mb-6 text-base font-semibold text-gray-800">Produits les plus vendus</h2>
            {bestSellers.length > 0 ? (
                <div className="space-y-5">
                    {bestSellers.map((product) => (
                        <div key={product.id} className="flex items-center space-x-4">
                            <div className="w-12 h-12 flex items-center justify-center rounded-lg flex-shrink-0 bg-gray-100 text-gray-400">
                                <ProductIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 truncate">{product.nom_article}</p>
                                <p className="text-sm text-gray-500">{product.totalRevenue.toLocaleString('fr-FR')} F de revenus</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">{product.totalQuantity}</p>
                                <p className="text-xs text-gray-500">unités</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full min-h-48 text-center text-gray-500">
                    <p>Aucune donnée de vente disponible pour afficher les meilleurs produits.</p>
                </div>
            )}
        </div>
    );
};

export default BestSeller;