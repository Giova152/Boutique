"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

export default function CartIcon() {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <button
      onClick={() => setIsCartOpen(true)}
      className="relative p-2.5 rounded-full hover:bg-emerald-50 text-gray-700 hover:text-primary-600 transition-colors focus:outline-none"
      aria-label="Voir le panier"
    >
      <ShoppingBag size={22} />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce-in shadow-md">
          {totalItems}
        </span>
      )}
    </button>
  );
}
