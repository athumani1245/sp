import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

// Create driver instance with custom styling
export const createTourDriver = (onComplete) => {
    return driver({
        showProgress: true,
        showButtons: ['next', 'previous', 'close'],
        progressText: '{{current}} of {{total}}',
        nextBtnText: 'Next →',
        prevBtnText: '← Back',
        doneBtnText: 'Done ✓',
        closeBtnText: 'Skip',
        onDestroyed: () => {
            if (onComplete) {
                onComplete();
            }
        },
        popoverClass: 'tanaka-tour-popover',
        overlayColor: 'rgba(0, 0, 0, 0.7)',
        smoothScroll: true,
        allowClose: true,
        disableActiveInteraction: false,
    });
};

// Tour steps for Add Property workflow
export const addPropertyTourSteps = [
    {
        element: '.add-property-btn',
        popover: {
            title: '🏢 Step 1: Add New Property',
            description: 'Click here to open the form for adding a new property. You\'ll need to provide property details like name, address, and location.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '📝 Fill Property Details',
            description: 'In the form, you\'ll enter:<br/>• Property name<br/>• Address (street, region, district, ward)<br/>• Property type (Residential/Commercial)<br/>• Assigned property manager',
            side: 'center'
        }
    },
    {
        popover: {
            title: '💡 Pro Tip',
            description: 'After creating a property, you can add multiple units to it. Each unit can be leased separately to different tenants.',
            side: 'center'
        }
    }
];

// Tour steps for Add Unit workflow
export const addUnitTourSteps = [
    {
        popover: {
            title: '🚪 Add Units to Property',
            description: 'To add units, you first need to select a property. Let\'s see how this works!',
            side: 'center'
        }
    },
    {
        element: '.properties-list',
        popover: {
            title: 'Step 1: Select Property',
            description: 'Click on any property from this list to view its details and add units to it.',
            side: 'top',
            align: 'start'
        }
    },
    {
        popover: {
            title: 'Step 2: Add Units',
            description: 'Once inside a property, click the "Add Unit" button. You\'ll specify:<br/>• Unit name/number (e.g., "Apt 101")<br/>• Monthly rent amount',
            side: 'center'
        }
    },
    {
        popover: {
            title: '✨ Units Are Essential',
            description: 'Units are what you lease to tenants. A property can have multiple units, each tracked separately.',
            side: 'center'
        }
    }
];

// Tour steps for Add Tenant workflow
export const addTenantTourSteps = [
    {
        element: '.add-tenant-btn',
        popover: {
            title: '👤 Step 1: Add New Tenant',
            description: 'Click here to register a new tenant in your system. You\'ll collect their personal information.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '📋 Tenant Information Required',
            description: 'You\'ll need to provide:<br/>• First and last name<br/>• Phone number<br/>• Email address<br/>• ID number (optional)<br/>• Emergency contact (optional)',
            side: 'center'
        }
    },
    {
        popover: {
            title: '🔄 Next Step',
            description: 'After adding a tenant, you can create a lease agreement to assign them to a unit.',
            side: 'center'
        }
    }
];

// Tour steps for Add Lease workflow
export const addLeaseTourSteps = [
    {
        element: '.create-lease-btn',
        popover: {
            title: '📄 Step 1: Create Lease Agreement',
            description: 'Click here to start creating a new lease agreement. This connects a tenant to a unit.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '🔗 Lease Connects Everything',
            description: 'A lease agreement links:<br/>• A tenant<br/>• To a specific unit<br/>• For a defined period<br/>• With payment terms',
            side: 'center'
        }
    },
    {
        popover: {
            title: '📝 Lease Details Required',
            description: 'You\'ll select:<br/>• Tenant (from your tenant list)<br/>• Property and unit<br/>• Start and end dates<br/>• Rent amount and payment frequency<br/>• Deposit amount',
            side: 'center'
        }
    },
    {
        popover: {
            title: '✅ Prerequisites',
            description: 'Before creating a lease, make sure you have:<br/>✓ Added the property<br/>✓ Added units to that property<br/>✓ Registered the tenant',
            side: 'center'
        }
    }
];

// Tour steps for Add Payment workflow
export const addPaymentTourSteps = [
    {
        element: '.leases-table',
        popover: {
            title: '💰 Step 1: Select a Lease',
            description: 'To record a payment, first click on a lease from this table. This will open the lease details.',
            side: 'top',
            align: 'start'
        }
    },
    {
        popover: {
            title: '📊 Lease Details Page',
            description: 'Inside the lease details, you\'ll find:<br/>• Tenant information<br/>• Payment schedule<br/>• Payment history<br/>• Option to add new payments',
            side: 'center'
        }
    },
    {
        popover: {
            title: 'Step 2: Record Payment',
            description: 'Click "Add Payment" button and enter:<br/>• Payment amount<br/>• Payment date<br/>• Payment method<br/>• Reference number (optional)',
            side: 'center'
        }
    },
    {
        popover: {
            title: '📈 Track Everything',
            description: 'All payments are automatically tracked, showing:<br/>• Total paid<br/>• Balance remaining<br/>• Payment history<br/>• Outstanding amounts',
            side: 'center'
        }
    }
];

// Tour steps for Dashboard Overview
export const dashboardTourSteps = [
    {
        popover: {
            title:'Welcome to Tanaka Property Management!',
            description: 'Let\'s take a quick tour of your dashboard and show you how everything works.',
            side: 'center'
        }
    },
    {
        element: '.stats-card',
        popover: {
            title: 'Key Metrics',
            description: 'These cards show your most important statistics:<br/>• Total properties<br/>• Active leases<br/>• Revenue metrics<br/>• Occupancy rates',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '.sidebar [href="/properties"]',
        popover: {
            title: 'Properties Section',
            description: 'Manage all your properties here. Add new properties, view details, and organize units.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '.sidebar [href="/property-managers"]',
        popover: {
            title: 'Property Managers Section',
            description: 'Manage property managers who oversee your properties. Add new managers and assign them to properties.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '.sidebar [href="/tenants"]',
        popover: {
            title: 'Tenants Section',
            description: 'Keep track of all your tenants. Add new tenants, view their history, and manage contact information.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '.sidebar [href="/leases"]',
        popover: {
            title: 'Leases Section',
            description: 'Manage lease agreements between tenants and units. Track payments, renewals, and terminations.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '.sidebar .nav-item:nth-child(7) > a',
        popover: {
            title: 'Reports Section',
            description: 'Generate detailed reports for financial analysis, occupancy, and property performance.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: 'Getting Started',
            description: 'Ready to begin? Here\'s the typical workflow:<br/>1️⃣ Add properties<br/>2️⃣ Create units<br/>3️⃣ Register tenants<br/>4️⃣ Create lease agreements<br/>5️⃣ Record payments',
            side: 'center'
        }
    }
];

// Tour steps for Property Details Page
export const propertyDetailsTourSteps = [
    {
        popover: {
            title: '🏢 Property Details',
            description: 'This page shows everything about a specific property. Let\'s explore the key sections!',
            side: 'center'
        }
    },
    {
        element: '.property-info',
        popover: {
            title: '📍 Property Information',
            description: 'Basic property details including name, address, type, and assigned manager.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '.units-section',
        popover: {
            title: '🚪 Units Management',
            description: 'View all units in this property. Add new units, edit existing ones, or view their lease status.',
            side: 'top',
            align: 'start'
        }
    },
    {
        element: '.add-unit-btn',
        popover: {
            title: '➕ Add Units',
            description: 'Click here to add new units to this property. Each unit can be leased separately.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        popover: {
            title: '✅ Next Steps',
            description: 'After adding units, you can:<br/>• Assign tenants through leases<br/>• Track unit occupancy<br/>• Monitor unit-specific payments',
            side: 'center'
        }
    }
];
