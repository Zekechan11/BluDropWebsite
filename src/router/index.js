import AgentLayout from '@/layout/Agent/AgentLayout.vue';
import AppLayout from '@/layout/AppLayout.vue';
import Layout from '@/layout/User/Layout.vue';
import QrGenerator from '@/views/admin/NewCustomer.vue';
import Landing from '@/views/pages/Landing.vue';
import QrDisplay from '@/views/user/Dashboard.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Landing page route
    {
      path: '/',
      component: Landing,
      children: [
        {
          path: '/',
          name: 'landing',
          component: () => import('@/views/pages/Landing.vue')
        },
      ]
    },
    // User routes
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '/user/dashboard',
          name: 'dashboard',
          component: () => import('@/views/user/Dashboard.vue')
        },
        {
          path: '/user/messages',
          name: 'messages',
          component: () => import('@/views/user/Chat.vue')
        },
        {
          path: '/user/settings',
          name: 'user-settings',
          component: () => import('@/views/user/Setting.vue')
        }
      ]
    },
    // Agent routes
    {
      path: '/',
      component: AgentLayout,
      children: [
        {
          path: '/agent/dashboard',
          name: 'dashboards',
          component: () => import('@/views/agent/Dashboard.vue')
        },
        {
          path: '/agent/history',
          name: 'historys',
          component: () => import('@/views/agent/History.vue')
        },
        {
          path: '/agent/message',
          name: 'messagess',
          component: () => import('@/views/agent/Chat.vue')
        },
        {
          path: '/agent/settings',
          name: 'settingss',
          component: () => import('@/views/agent/Setting.vue')
        },
        {
          path: '/agent/scanner',
          name: 'scanner',
          component: () => import('@/views/agent/Scan.vue')
        },
        {
          path: '/agent/payment/:slug',
          name: 'payment',
          component: () => import('@/views/agent/Payment.vue')
        },
        {
          path: '/agent/create-customer',
          name: 'create-customer',
          component: () => import('@/views/agent/CreateCustomer.vue')
        },
        {
          path: '/agent/record',
          name: 'record',
          component: () => import('@/views/agent/CustomerRecord.vue')
        }
      ]
    },
    // Admin routes
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '/views/dashboard',
          name: 'dashboardss',
          component: () => import('@/views/admin/Dashboard.vue')
        },
        {
          path: '/admin/settings',
          name: 'settings',
          component: () => import('@/views/admin/Setting.vue')
        },
        {
          path: '/admin/create-account',
          name: 'create-account',
          component: () => import('@/views/admin/NewCustomer.vue')
        },
        {
          path: '/admin/Customer/add-customer',
          name: 'add-customer',
          component: () => import('@/views/admin/AddCustomer.vue')
        },

        {
          path: '/admin/add-staff',
          name: 'addstaff',
          component: () => import('@/views/admin/AddStaff.vue')
        },

        {
          path: '/admin/add-remittance',
          name: 'addRemittance',
          component: () => import('@/views/admin/AddRemittance.vue')
        },

        {
          path: '/admin/add-agent',
          name: 'addagent',
          component: () => import('@/views/admin/AddAgent.vue')
        },
        {
          path: '/admin/add-inventory',
          name: 'inventory',
          component: () => import('@/views/admin/AddInventory.vue')
        },
        {
          path: '/admin/fgs-loan',
          name: 'fgs-loan',
          component: () => import('@/views/admin/FGS.vue')
        },
        {
          path: '/admin/sales',
          name: 'sales',
          component: () => import('@/views/admin/Sales.vue')
        },
        {
          path: '/admin/message',
          name: 'message',
          component: () => import('@/views/admin/Chat.vue')
        },
        {
          path: '/admin/area',
          name: 'area',
          component: () => import('@/views/admin/Area.vue')
        },
      ]
    },
    // QR routes
    {
      path: '/qr-generator',
      name: 'qr-generator',
      component: QrGenerator
    },
    {
      path: '/qr-display',
      name: 'qr-display',
      component: QrDisplay
    },
    // Auth routes
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('@/views/pages/auth/Login.vue')
    },
    {
      path: '/auth/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/pages/auth/ForgotPassword.vue')
    }
  ]
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const user_data = JSON.parse(localStorage.getItem('user_data'));// Get the role from localStorage

  // Define public routes (routes that don't require authentication)
  const publicRoutes = ['/auth/login', '/auth/forgot-password', '/'];

  // If user is not logged in, allow access to public routes
  if (!token && !publicRoutes.includes(to.path)) {
    return next({ name: 'login' }); // Redirect to login page
  }

   // If user is already logged in and trying to access the login page
   if (token && to.path === '/auth/login') {
    // Redirect to the appropriate dashboard based on the user's role
    if (user_data.role === 'Admin') {
      return next({ name: 'dashboardss' }); // Redirect to Admin Dashboard
    } else if (user_data.role === 'Agent') {
      return next({ name: 'dashboards' }); // Redirect to Staff Dashboard
    } else if (user_data.role === 'Customer') {
      return next({ name: 'dashboard' }); // Redirect to Customer Dashboard
    }
  }

  // If the user is logged in, prevent them from accessing routes not allowed for their role
  if (token) {
    // Redirect based on the user's role
    if (user_data.role === 'Admin') {
      if (to.path.startsWith('/admin')) {
        return next(); // Allow access to admin routes
      } else if (to.path.startsWith('/agent') || to.path.startsWith('/user')) {
        return next({ name: 'dashboardss' }); // Redirect to Admin Dashboard
      }
    } else if (user_data.role === 'Agent') {
      if (to.path.startsWith('/admin') || to.path.startsWith('/user')) {
        return next({ name: 'dashboards' }); // Redirect to Staff Dashboard
      } else if (to.path.startsWith('/user')) {
        return next(); // Allow access to user routes
      }
    } else if (user_data.role === 'Customer') {
      if (to.path.startsWith('/admin') || to.path.startsWith('/agent')) {
        return next({ name: 'dashboard' }); // Redirect to Customer Dashboard
      } else if (to.path.startsWith('/user')) {
        return next(); // Allow access to user routes
      }
    }
  }

  next(); // Proceed with the route
});

export default router;
