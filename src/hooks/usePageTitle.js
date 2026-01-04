import { useEffect } from 'react';

/**
 * Custom hook to set the page title dynamically
 * @param {string} title - The title to set for the page
 */
export const usePageTitle = (title) => {
    useEffect(() => {
        const baseTitle = 'Tanaka';
        document.title = title ? `${title} | ${baseTitle}` : baseTitle;
        
        // Cleanup function to reset title when component unmounts
        return () => {
            document.title = baseTitle;
        };
    }, [title]);
};

export default usePageTitle;
