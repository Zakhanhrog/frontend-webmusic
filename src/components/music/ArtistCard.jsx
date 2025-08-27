import React from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.muzo.com.vn';

const ArtistCard = ({ artist }) => {
    const imageUrl = artist.avatarPath ? `${API_BASE_URL}${artist.avatarPath}` : 'https://via.placeholder.com/150';

    return (
        <Link to={`/singer/${artist.id}`} className="block group text-center">
            <div className="relative w-full aspect-square rounded-full overflow-hidden shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                <img src={imageUrl} alt={artist.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="mt-4 font-semibold truncate">{artist.name}</h3>
        </Link>
    );
};

export default ArtistCard;