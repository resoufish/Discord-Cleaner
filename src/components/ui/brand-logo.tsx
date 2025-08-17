interface BrandLogoProps {
    variant?: 'icon' | 'wordmark' | 'full';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    animated?: boolean;
}

export function BrandLogo({
    variant = 'icon',
    size = 'md',
    className = '',
    animated = false
}: BrandLogoProps) {
    const getSizeClasses = () => {
        switch (size) {
            case 'sm': return 'w-8 h-8';
            case 'md': return 'w-12 h-12';
            case 'lg': return 'w-16 h-16';
            case 'xl': return 'w-24 h-24';
            default: return 'w-12 h-12';
        }
    };

    const getWordmarkSizeClasses = () => {
        switch (size) {
            case 'sm': return 'w-32 h-8';
            case 'md': return 'w-40 h-10';
            case 'lg': return 'w-56 h-16';
            case 'xl': return 'w-72 h-20';
            default: return 'w-40 h-10';
        }
    };

    if (variant === 'wordmark') {
        return (
            <div className={`${getWordmarkSizeClasses()} ${animated ? 'hover:scale-105 transition-transform duration-300' : ''} ${className}`}>
                <svg width="100%" height="100%" viewBox="0 0 280 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                            <stop offset="50%" style={{ stopColor: '#7c3aed', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#6d28d9', stopOpacity: 1 }} />
                        </linearGradient>

                        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                            <stop offset="50%" style={{ stopColor: '#7c3aed', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#6d28d9', stopOpacity: 1 }} />
                        </linearGradient>

                        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>

                    <g transform="translate(10, 20)">
                        <circle cx="20" cy="20" r="18" fill="#1e293b" stroke="url(#iconGradient)" strokeWidth="1.5" />

                        <g transform="translate(12, 8)">
                            <rect x="6" y="6" width="3" height="16" rx="1.5" fill="url(#iconGradient)" />

                            <g fill="url(#iconGradient)" opacity="0.9">
                                <rect x="4.5" y="3" width="1" height="6" rx="0.5" transform="rotate(-10 4.5 3)" />
                                <rect x="6" y="2" width="1" height="7" rx="0.5" />
                                <rect x="7.5" y="2" width="1" height="7" rx="0.5" />
                                <rect x="9" y="2" width="1" height="7" rx="0.5" />
                                <rect x="10.5" y="3" width="1" height="6" rx="0.5" transform="rotate(10 10.5 3)" />
                            </g>

                            <g fill="url(#accentGradient)">
                                <circle cx="2" cy="8" r="1" opacity="0.8" />
                                <circle cx="14" cy="6" r="0.8" opacity="0.6" />
                                <circle cx="4" cy="18" r="0.6" opacity="0.7" />
                                <circle cx="12" cy="16" r="0.8" opacity="0.8" />
                            </g>
                        </g>
                    </g>

                    <g transform="translate(60, 25)" fill="url(#textGradient)">
                        <text x="0" y="20" fontFamily="Inter, -apple-system, sans-serif" fontSize="24" fontWeight="700" letterSpacing="-0.02em">
                            DISCORD
                        </text>
                    </g>

                    <g transform="translate(60, 45)" fill="url(#textGradient)">
                        <text x="0" y="20" fontFamily="Inter, -apple-system, sans-serif" fontSize="24" fontWeight="300" letterSpacing="0.05em" opacity="0.9">
                            CLEANER
                        </text>
                    </g>

                    <line x1="170" y1="35" x2="270" y2="35" stroke="url(#iconGradient)" strokeWidth="2" opacity="0.6" strokeLinecap="round" />

                    <g transform="translate(60, 60)" fill="#94a3b8">
                        <text x="0" y="12" fontFamily="Inter, -apple-system, sans-serif" fontSize="11" fontWeight="400" letterSpacing="0.02em">
                            Safe Message Cleanup
                        </text>
                    </g>

                    <g fill="url(#accentGradient)" opacity="0.6">
                        <circle cx="250" cy="20" r="1.5" />
                        <circle cx="265" cy="30" r="1" />
                        <circle cx="255" cy="50" r="1.2" />
                        <circle cx="240" cy="60" r="0.8" />
                    </g>
                </svg>
            </div>
        );
    }

    if (variant === 'full') {
        return (
            <div className={`w-32 h-32 ${animated ? 'hover:scale-105 transition-transform duration-300' : ''} ${className}`}>
                <svg width="100%" height="100%" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                            <stop offset="50%" style={{ stopColor: '#7c3aed', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#6d28d9', stopOpacity: 1 }} />
                        </linearGradient>

                        <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                            <stop offset="50%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#047857', stopOpacity: 1 }} />
                        </linearGradient>

                        <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#1e293b', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#0f172a', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>

                    <circle cx="60" cy="60" r="56" fill="url(#backgroundGradient)" stroke="url(#primaryGradient)" strokeWidth="2" />
                    <circle cx="60" cy="60" r="48" fill="none" stroke="url(#primaryGradient)" strokeWidth="1" opacity="0.3" />

                    <g transform="translate(35, 25)">
                        <path d="M25 8C25 8 18 4 10 4S-5 8 -5 8V28C-5 38 10 50 25 50S55 38 55 28V8C55 8 48 4 40 4S25 8 25 8Z"
                            fill="none"
                            stroke="url(#primaryGradient)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round" />

                        <g transform="translate(15, 12)">
                            <rect x="8" y="2" width="4" height="24" rx="2" fill="url(#primaryGradient)" />
                            <rect x="9" y="22" width="2" height="12" rx="1" fill="url(#primaryGradient)" opacity="0.8" />

                            <g fill="url(#primaryGradient)" opacity="0.9">
                                <rect x="6" y="0" width="1.5" height="8" rx="0.75" transform="rotate(-10 6 0)" />
                                <rect x="8" y="0" width="1.5" height="10" rx="0.75" />
                                <rect x="10" y="0" width="1.5" height="9" rx="0.75" />
                                <rect x="12" y="0" width="1.5" height="8" rx="0.75" transform="rotate(10 12 0)" />
                                <rect x="14" y="0" width="1.5" height="7" rx="0.75" transform="rotate(15 14 0)" />
                            </g>
                        </g>

                        <g fill="url(#successGradient)" opacity="0.8">
                            <circle cx="8" cy="15" r="2" />
                            <circle cx="42" cy="18" r="1.5" />
                            <circle cx="12" cy="35" r="1" />
                            <circle cx="38" cy="32" r="1.5" />
                            <circle cx="45" cy="12" r="1" />

                            <circle cx="15" cy="10" r="0.5" />
                            <circle cx="35" cy="8" r="0.5" />
                            <circle cx="18" cy="38" r="0.5" />
                            <circle cx="32" cy="40" r="0.5" />
                            <circle cx="6" cy="28" r="0.5" />
                            <circle cx="44" cy="25" r="0.5" />
                        </g>
                    </g>

                    <circle cx="60" cy="60" r="2" fill="url(#successGradient)" opacity="0.8" />

                    {animated && (
                        <g opacity="0.6">
                            <animateTransform attributeName="transform" type="rotate" values="0 60 60;360 60 60" dur="20s" repeatCount="indefinite" />
                            <circle cx="20" cy="60" r="1" fill="url(#primaryGradient)" opacity="0.5" />
                            <circle cx="100" cy="60" r="1.5" fill="url(#successGradient)" opacity="0.4" />
                            <circle cx="60" cy="20" r="0.8" fill="url(#primaryGradient)" opacity="0.6" />
                            <circle cx="60" cy="100" r="1.2" fill="url(#successGradient)" opacity="0.3" />
                        </g>
                    )}
                </svg>
            </div>
        );
    }

    // Default icon variant
    return (
        <div className={`${getSizeClasses()} ${animated ? 'hover:scale-110 transition-transform duration-300' : ''} ${className}`}>
            <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#7c3aed', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#6d28d9', stopOpacity: 1 }} />
                    </linearGradient>

                    <linearGradient id="successGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#047857', stopOpacity: 1 }} />
                    </linearGradient>

                    <linearGradient id="backgroundGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#1e293b', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#0f172a', stopOpacity: 1 }} />
                    </linearGradient>
                </defs>

                <rect x="0" y="0" width="64" height="64" rx="16" fill="url(#backgroundGrad)" />
                <rect x="1" y="1" width="62" height="62" rx="15" fill="none" stroke="url(#primaryGrad)" strokeWidth="1" opacity="0.6" />

                <g transform="translate(20, 16)">
                    <rect x="10" y="8" width="4" height="20" rx="2" fill="url(#primaryGrad)" />

                    <g fill="url(#primaryGrad)" opacity="0.9">
                        <rect x="8" y="4" width="1.5" height="8" rx="0.75" transform="rotate(-15 8 4)" />
                        <rect x="10" y="2" width="1.5" height="10" rx="0.75" transform="rotate(-5 10 2)" />
                        <rect x="12" y="1" width="1.5" height="11" rx="0.75" />
                        <rect x="14" y="2" width="1.5" height="10" rx="0.75" transform="rotate(5 14 2)" />
                        <rect x="16" y="4" width="1.5" height="8" rx="0.75" transform="rotate(15 16 4)" />
                    </g>

                    <g fill="url(#successGrad)">
                        <circle cx="4" cy="12" r="1.5" opacity="0.8" />
                        <circle cx="20" cy="8" r="1" opacity="0.6" />
                        <circle cx="6" cy="24" r="1" opacity="0.7" />
                        <circle cx="18" cy="26" r="1.5" opacity="0.8" />

                        <circle cx="8" cy="6" r="0.5" opacity="0.5" />
                        <circle cx="16" cy="20" r="0.5" opacity="0.6" />
                        <circle cx="2" cy="18" r="0.5" opacity="0.4" />
                        <circle cx="22" cy="14" r="0.5" opacity="0.5" />
                    </g>
                </g>

                <g opacity="0.3">
                    <circle cx="12" cy="12" r="1" fill="url(#primaryGrad)" />
                    <circle cx="52" cy="52" r="1" fill="url(#primaryGrad)" />
                    <circle cx="52" cy="12" r="0.5" fill="url(#successGrad)" />
                    <circle cx="12" cy="52" r="0.5" fill="url(#successGrad)" />
                </g>
            </svg>
        </div>
    );
}