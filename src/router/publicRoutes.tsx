import type { RouteObject } from 'react-router-dom';
import { PublicWebsiteLayout } from '../layouts/PublicWebsiteLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { VerificationPage } from '../pages/auth/VerificationPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { PublicTrackingPage } from '../pages/public/PublicTrackingPage';
import { RoutePlaceholder } from '../components/common/RoutePlaceholder';

export const publicRoutes: RouteObject = {
  children: [
    {
      path: '/track',
      element: <PublicTrackingPage />,
    },
    {
      path: '/track/:awb',
      element: <PublicTrackingPage />,
    },
    {
      path: '/track/:merchantSlug/:awb',
      element: <PublicTrackingPage />,
    },
    // Marketing Public Routes (PublicWebsiteLayout)
    {
      element: <PublicWebsiteLayout />,
      children: [
        {
          path: '/',
          element: <LandingPage />,
        },
        {
          path: '/features',
          element: <RoutePlaceholder moduleName="Platform Features Overview" portal="Public" path="/features" />,
        },
        {
          path: '/pricing',
          element: <RoutePlaceholder moduleName="SaaS Pricing Plans" portal="Public" path="/pricing" />,
        },
        {
          path: '/integrations',
          element: <RoutePlaceholder moduleName="Courier & Store Integrations" portal="Public" path="/integrations" />,
        },
        {
          path: '/tracking',
          element: <RoutePlaceholder moduleName="Public Parcel Tracking Portal" portal="Public" path="/tracking" />,
        },
        {
          path: '/about',
          element: <RoutePlaceholder moduleName="About Us & Company Overview" portal="Public" path="/about" />,
        },
        {
          path: '/contact',
          element: <RoutePlaceholder moduleName="Contact Sales & Support" portal="Public" path="/contact" />,
        },
        {
          path: '/faq',
          element: <RoutePlaceholder moduleName="Frequently Asked Questions" portal="Public" path="/faq" />,
        },
      ],
    },
    // Dedicated Super Admin Login Route
    {
      path: '/admin/login',
      element: <AdminLoginPage />,
    },
    // Authentication Routes (AuthLayout)
    {
      element: <AuthLayout />,
      children: [
        {
          path: '/login',
          element: <LoginPage />,
        },
        {
          path: '/auth/login',
          element: <LoginPage />,
        },
        {
          path: '/signup',
          element: <SignupPage />,
        },
        {
          path: '/register',
          element: <SignupPage />,
        },
        {
          path: '/auth/register',
          element: <SignupPage />,
        },
        {
          path: '/auth/verify',
          element: <VerificationPage />,
        },
        {
          path: '/forgot-password',
          element: <ForgotPasswordPage />,
        },
      ],
    },
  ],
};
