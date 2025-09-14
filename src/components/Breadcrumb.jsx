import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaHome, FaChevronRight } from 'react-icons/fa';

const Breadcrumb = () => {
  const location = useLocation();

  // Define breadcrumb paths
  const breadcrumbMap = {
    '/landing': [{ label: 'Accueil', path: '/landing' }],
    '/dashboard': [
      { label: 'Accueil', path: '/landing' },
      { label: 'Dashboard', path: '/dashboard' }
    ],
    '/create-cagnotte': [
      { label: 'Accueil', path: '/landing' },
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Créer une cagnotte', path: '/create-cagnotte' }
    ],
    '/profil': [
      { label: 'Accueil', path: '/landing' },
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Profil', path: '/profil' }
    ],
    '/explorePage': [
      { label: 'Accueil', path: '/landing' },
      { label: 'Explorer', path: '/explorePage' }
    ],
    '/notifications': [
      { label: 'Accueil', path: '/landing' },
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Notifications', path: '/notifications' }
    ],
    '/transactions': [
      { label: 'Accueil', path: '/landing' },
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Transactions', path: '/transactions' }
    ],
    '/kyc': [
      { label: 'Accueil', path: '/landing' },
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Vérification KYC', path: '/kyc' }
    ]
  };

  // Handle dynamic routes
  const getBreadcrumbs = (pathname) => {
    // Cagnotte details
    if (pathname.startsWith('/cagnottes/')) {
      const id = pathname.split('/')[2];
      return [
        { label: 'Accueil', path: '/landing' },
        { label: 'Explorer', path: '/explorePage' },
        { label: 'Détails de la cagnotte', path: pathname }
      ];
    }

    // Contribute page
    if (pathname.startsWith('/contribute/')) {
      const id = pathname.split('/')[2];
      return [
        { label: 'Accueil', path: '/landing' },
        { label: 'Explorer', path: '/explorePage' },
        { label: 'Détails de la cagnotte', path: `/cagnottes/${id}` },
        { label: 'Contribuer', path: pathname }
      ];
    }

    // Contributors page
    if (pathname.startsWith('/contributors/')) {
      const id = pathname.split('/')[2];
      return [
        { label: 'Accueil', path: '/landing' },
        { label: 'Explorer', path: '/explorePage' },
        { label: 'Détails de la cagnotte', path: `/cagnottes/${id}` },
        { label: 'Contributeurs', path: pathname }
      ];
    }

    // Edit cagnotte
    if (pathname.startsWith('/edit-cagnotte/')) {
      const id = pathname.split('/')[2];
      return [
        { label: 'Accueil', path: '/landing' },
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Détails de la cagnotte', path: `/cagnottes/${id}` },
        { label: 'Modifier', path: pathname }
      ];
    }

    // Return static breadcrumbs or default
    return breadcrumbMap[pathname] || [{ label: 'Accueil', path: '/landing' }];
  };

  const breadcrumbs = getBreadcrumbs(location.pathname);

  // Don't show breadcrumbs on login/register pages
  if (['/login', '/register', '/forgot-password'].includes(location.pathname) ||
      location.pathname.startsWith('/reset-password')) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 py-3">
          <Link
            to="/landing"
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaHome className="w-4 h-4" />
          </Link>

          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              <FaChevronRight className="w-3 h-3 text-gray-400" />
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Breadcrumb;