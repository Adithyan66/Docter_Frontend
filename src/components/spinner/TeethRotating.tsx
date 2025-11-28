

import React from 'react';
import teeth from '@assets/teethSpinner.png'



type RotatingSpinnerProps = {
    fullscreen?: boolean;
};

const RotatingSpinner: React.FC<RotatingSpinnerProps> = ({ fullscreen = true }) => {
    const containerClasses = fullscreen
        ? 'fixed inset-0 z-50 flex items-center justify-center '
        : 'flex items-center justify-center';

    return (
        <div className={containerClasses}>
            <div className="text-center">
                <div className="relative inline-block">
                    <img
                        src={teeth}
                        alt="Loading spinner"
                        className="w-20 h-20 animate-spin"
                        style={{ animationDuration: '2s' }}
                    />
                </div>
                <p className="mt-3 text-gray-300 text-sm font-medium">Loading...</p>
            </div>
        </div>
    );
};

export default RotatingSpinner;