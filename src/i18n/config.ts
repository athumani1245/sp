import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enAuth from './locales/en/auth.json';
import enCommon from './locales/en/common.json';
import enProperties from './locales/en/properties.json';
import enTenants from './locales/en/tenants.json';
import enLeases from './locales/en/leases.json';
import enDashboard from './locales/en/dashboard.json';
import enProfile from './locales/en/profile.json';
import enLeaseReport from './locales/en/leaseReport.json';
import enLeaseExpiryReport from './locales/en/leaseExpiryReport.json';
import enSubscription from './locales/en/subscription.json';
import enPropertyManagers from './locales/en/propertyManagers.json';
import enChatter from './locales/en/chatter.json';
import swAuth from './locales/sw/auth.json';
import swCommon from './locales/sw/common.json';
import swProperties from './locales/sw/properties.json';
import swTenants from './locales/sw/tenants.json';
import swLeases from './locales/sw/leases.json';
import swDashboard from './locales/sw/dashboard.json';
import swProfile from './locales/sw/profile.json';
import swLeaseReport from './locales/sw/leaseReport.json';
import swLeaseExpiryReport from './locales/sw/leaseExpiryReport.json';
import swSubscription from './locales/sw/subscription.json';
import swPropertyManagers from './locales/sw/propertyManagers.json';
import swChatter from './locales/sw/chatter.json';

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        auth: enAuth,
        common: enCommon,
        properties: enProperties,
        tenants: enTenants,
        leases: enLeases,
        dashboard: enDashboard,
        profile: enProfile,
        leaseReport: enLeaseReport,
        leaseExpiryReport: enLeaseExpiryReport,
        subscription: enSubscription,
        propertyManagers: enPropertyManagers,
        chatter: enChatter,
      },
      sw: {
        auth: swAuth,
        common: swCommon,
        properties: swProperties,
        tenants: swTenants,
        leases: swLeases,
        dashboard: swDashboard,
        profile: swProfile,
        leaseReport: swLeaseReport,
        leaseExpiryReport: swLeaseExpiryReport,
        subscription: swSubscription,
        propertyManagers: swPropertyManagers,
        chatter: swChatter,
      },
    },
    lng: localStorage.getItem('language') || 'en', // Load saved language or default to English
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'auth', 'properties', 'tenants', 'leases', 'dashboard', 'profile', 'leaseReport', 'leaseExpiryReport', 'subscription', 'propertyManagers', 'chatter'],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
