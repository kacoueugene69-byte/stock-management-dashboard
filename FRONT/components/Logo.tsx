import React from 'react';

interface LogoProps {
    className?: string;
    variant?: 'light-on-dark' | 'dark-on-light';
    size?: 'sm' | 'md' | 'lg'; // sm for sidebar, md for invoice, lg for login/spinner
    iconOnly?: boolean;
}

const sizeStyles = {
    sm: {
        icon: 'h-8 w-7',
        cText: 'text-xl',
        plusText: 'text-[9px] -mt-2 -mr-1',
        brandText: 'ml-3 text-xl',
    },
    md: {
        icon: 'h-10 w-9',
        cText: 'text-2xl',
        plusText: 'text-[10px] -mt-2 -mr-1.5',
        brandText: 'ml-3 text-xl',
    },
    lg: {
        icon: 'h-14 w-12',
        cText: 'text-3xl',
        plusText: 'text-xs -mt-2.5 -mr-1.5',
        brandText: 'ml-4 text-2xl',
    }
};

const Logo: React.FC<LogoProps> = ({ 
    className = '', 
    variant = 'light-on-dark', 
    size = 'sm',
    iconOnly = false
}) => {
    const styles = sizeStyles[size];
    const isLightOnDark = variant === 'light-on-dark';

    const iconBg = isLightOnDark ? 'bg-white' : 'bg-blue-950';
    const iconText = isLightOnDark ? 'text-blue-950' : 'text-white';
    const brandText = isLightOnDark ? 'text-white' : 'text-blue-950';

    return (
        <div className={`flex items-center ${className}`}>
            <div
                className={`relative flex items-center justify-center flex-shrink-0 ${styles.icon} ${iconBg}`}
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}
            >
                <div className={`relative z-10 flex flex-col items-center justify-center font-bold ${iconText}`}>
                    <span className={`${styles.cText} leading-none`}>C</span>
                    <span className={`${styles.plusText} leading-none self-end`}>++</span>
                </div>
            </div>
            {!iconOnly && (
                <span className={`font-bold tracking-wider ${styles.brandText} ${brandText}`}>
                    CDCOM-FACI
                </span>
            )}
        </div>
    );
};

export default Logo;
