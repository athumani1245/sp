import { useState, useEffect } from 'react';
import { getRegions, getDistricts, getWards, getAllPropertyManagers } from '../../../services/propertyService';

export const useLocationData = (isOpen) => {
    const [regions, setRegions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [propertyManagers, setPropertyManagers] = useState([]);
    const [locationLoading, setLocationLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadRegions();
            loadPropertyManagers();
        }
    }, [isOpen]);

    const loadRegions = async () => {
        try {
            setLocationLoading(true);
            const response = await getRegions();
            if (response.success) {
                setRegions(response.data || []);
            } else {
                setError(response.error || 'Failed to load regions');
                setRegions([]);
            }
        } catch (error) {
            setError('Failed to load regions');
            setRegions([]);
        } finally {
            setLocationLoading(false);
        }
    };

    const loadPropertyManagers = async () => {
        try {
            const result = await getAllPropertyManagers();
            if (result.success) {
                setPropertyManagers(result.data || []);
            }
        } catch (error) {
            // Silent fail for optional property managers
        }
    };

    const loadDistricts = async (regionId) => {
        try {
            setLocationLoading(true);
            const response = await getDistricts(regionId);
            if (response.success) {
                setDistricts(response.data || []);
            } else {
                setError(response.error || 'Failed to load districts');
                setDistricts([]);
            }
        } catch (error) {
            setError('Failed to load districts');
            setDistricts([]);
        } finally {
            setLocationLoading(false);
        }
    };

    const loadWards = async (districtId) => {
        try {
            setLocationLoading(true);
            const response = await getWards(districtId);
            if (response.success) {
                setWards(response.data || []);
            } else {
                setError(response.error || 'Failed to load wards');
                setWards([]);
            }
        } catch (error) {
            setError('Failed to load wards');
            setWards([]);
        } finally {
            setLocationLoading(false);
        }
    };

    const resetLocationData = () => {
        setDistricts([]);
        setWards([]);
    };

    return {
        regions,
        districts,
        wards,
        propertyManagers,
        locationLoading,
        error,
        setError,
        loadDistricts,
        loadWards,
        resetLocationData
    };
};
