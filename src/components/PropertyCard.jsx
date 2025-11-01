'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function PropertyCard({ property }) {
  if (!property) return null;

  return (
    <div className="property-card max-w-sm rounded overflow-hidden shadow-lg m-4">
      <div className="relative h-48 w-full">
        <Image
          src={property.photo_url || property.photoUrl || '/img/default-property.jpg'}
          alt={property.title || 'Property image'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={60}
          loading="lazy"
          decoding="async"
          placeholder="empty"
        />
      </div>
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{property.title || 'Untitled Property'}</div>
        <p className="text-gray-700 text-base">
          {property.description?.substring(0, 100)}...
        </p>
      </div>
      <div className="px-6 pt-4 pb-2">
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
          {property.bedrooms || 'N/A'} Beds
        </span>
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
          {property.bathrooms || 'N/A'} Baths
        </span>
        <span className="inline-block bg-blue-200 rounded-full px-3 py-1 text-sm font-semibold text-blue-700">
          ${property.nightly_rate || '0'}/night
        </span>
      </div>
      <div className="px-6 py-4">
        <Link 
          href={`/LodgixProparties/${property.id}`}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full block text-center"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
