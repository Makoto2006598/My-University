
import React from 'react';

interface GameLogoProps {
    className?: string;
}

export const GameLogo: React.FC<GameLogoProps> = ({ className = "w-32 h-32" }) => {
    return (
        <div className={`${className} relative flex items-center justify-center`}>
            {/* Main Logo SVG */}
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl filter" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outer Ring / Shield Border */}
                <circle cx="100" cy="100" r="95" fill="#f8fafc" stroke="#94a3b8" strokeWidth="4"/>
                <circle cx="100" cy="100" r="88" stroke="#1e293b" strokeWidth="2" strokeOpacity="0.8"/>
                
                {/* Background Decor */}
                <path d="M20 100 H180" stroke="#1e293b" strokeWidth="2" strokeOpacity="0.2"/>
                
                {/* Central Pillar (Teal) */}
                <path d="M85 60 H115 V140 C115 150 100 160 100 160 C100 160 85 150 85 140 V60 Z" fill="#2dd4bf" stroke="#0f766e" strokeWidth="2"/>
                <path d="M92 70 H108 M92 80 H108 M92 90 H108" stroke="#0f766e" strokeWidth="2" strokeOpacity="0.5"/>

                {/* Flanking Columns (Gold) */}
                <rect x="60" y="80" width="20" height="60" fill="#d97706" stroke="#92400e" strokeWidth="2"/>
                <rect x="120" y="80" width="20" height="60" fill="#d97706" stroke="#92400e" strokeWidth="2"/>
                
                {/* The "M" (Navy Blue) */}
                <path d="M45 140 V70 L100 115 L155 70 V140" stroke="#1e3a8a" strokeWidth="18" strokeLinecap="square" strokeLinejoin="round"/>
                <path d="M45 140 V70 L100 115 L155 70 V140" stroke="#3b82f6" strokeWidth="4" strokeLinecap="square" strokeLinejoin="round"/>

                {/* Dome Top */}
                <path d="M80 50 Q100 30 120 50" stroke="#1e3a8a" strokeWidth="4" fill="none"/>
                <path d="M100 30 V45" stroke="#1e3a8a" strokeWidth="4"/>
                <circle cx="100" cy="28" r="3" fill="#d97706"/>

                {/* Bottom Banner Line */}
                <path d="M40 145 H160" stroke="#1e3a8a" strokeWidth="4"/>
            </svg>
        </div>
    );
};
