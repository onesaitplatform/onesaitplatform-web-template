import enLocale from '@ods/ods/lib/locale/lang/en'

export default {
  ...enLocale,
  label: 'English',
  labelMobile: 'EN',
  serverError: 'Unexpected server error. Try again.',

  breadcrumb: {
    home: 'Home',
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    users: 'Users',
    randomUser: 'Random user ',
    randomString: 'Random string param: ',
    editProfile: 'Edit user',
    myUser: 'My user',
    editUser: 'Edit user',
    userAccount: 'User Account'
  },
  login: {
    title: 'Login',
    user: 'Username',
    password: 'Password',
    submitButton: 'Send',
    rules: {
      user: 'Please, type a user name',
      password: 'Please, type a password'
    },
    logging: 'Loading...',
    loginErrorTitle: 'Validation Error',
    loginError: 'Invalid user or wrong password.',
    forgotPassword: 'Forgot your password?',
    keepMeLogged: 'Keep me logged in',
    login: 'Login',
    footerLinks: ['faq', 'terms', 'conditions'],
    social: {
      title: 'Login with'
    },
    register: {
      account: 'Not have account?',
      register: 'Register'
    }
  },
  password: {
    title: 'Reset password',
    message: 'Type your account\'s email to proceed',
    email: 'Email',
    submitButton: 'Submit',
    goBack: 'Go back',
    error: 'Email not found',
    sending: 'Sending...',
    rules: {
      email: 'Email not found'
    },
    emailSubmitted: 'We\'ve sent an email with the instructions to reset your password to: ',
    done: 'Finish',
    emailError: 'We can\'t find any account with this email:'
  },
  notifications: {
    popoverTitle: 'Hi, there!'
  },
  header: {
    user: {
      profile: 'Profile',
      account: 'Account',
      theme: 'Select Theme',
      logout: 'Log Out'
    }
  },
  navigation: {
    home: 'Home',
    dashboards: 'Dashboards',
    userFavorite: 'Favorite Dashboard',
    satcm19_clie_diag_01_dmo_01_tpl_01: 'Customers',
    UX_FINAL_GAGDETS: 'Dashboard UX',
    satcm19_prod_diag: 'Product Diagnostics',
    satcm19_prod_diag_01_dmo_01_tpl_01: 'Product Diagnostic 01',
    satcm19_prod_diag_01_dmo_01_tpl_02: 'Product Diagnostic 02',
    satcm19_rent_diag_01_dmo_01_tpl_01: 'Profitability',
    satcm18_ccial_diag: 'Commercial Diagnostics',
    satcm18_ccial_diag_01_dmo_01_tpl_01: 'Commercial Diagnostic 01',
    satcm18_ccial_diag_02_dmo_01_tpl_01: 'Commercial Diagnostic 02',
    satcm18_ccial_diag_03_dmo_01_tpl_01: 'Commercial Diagnostic 03',
    satcm18_ccial_diag_04_dmo_01_tpl_01: 'Commercial Diagnostic 04',
    satcm18_ccial_diag_05_dmo_01_tpl_01: 'Commercial Diagnostic 05',
    satcm18_ccial_diag_06_dmo_01_tpl_01: 'Commercial Diagnostic 06',
    satcm19_ccial_pred: 'Commercial Predictives',
    satcm18_ccial_pred_01_dmo_01_tpl_01: 'Commercial Predictive 01',
    satcm19_ccial_pred_02_dmo_02_tpl_01: 'Commercial Predictive 02',
    satcm18_riesg_diag: 'Risk Diagnostics',
    satcm18_riesg_diag_01_dmo_01_tpl_01: 'Risk Diagnostic 01',
    satcm18_riesg_diag_02_dmo_01_tpl_01: 'Risk Diagnostic 02',
    satcm18_riesg_diag_03_dmo_01_tpl_01: 'Risk Diagnostic 03',
    satcm19_impg_diag_01_dmo_01_tpl_01: 'Non-Payments',
    satcm19_tarj_diag_01_dmo_01_tpl_01: 'Cards'
  },
  filters: {
    showhide: 'Show/Hide Filters',
    filters: 'Filters',
    favorites: 'Favorites',
    noFavorites: 'No Favorites',
    favorites_search: 'Search favorite',
    entity: 'Entity',
    entity_placeholder: 'Select Entity',
    segment: 'Segment',
    segment_placeholder: 'Select Segment',
    product: 'Product',
    product_placeholder: 'Select Product',
    search: 'Search Gadgets and Dashboards',
    search_NoResults: 'No Gadgets Found',
    save_dashboard: 'Save Dashboard'
  },
  user: {
    account: {
      header: 'Personal Data',
      title: 'Change Password',
      info: 'You can change the password, enter the new password, and submit the form. After updating we will redirect you to the page you came from. The next login will be done with your new password. Thank you.',
      inputs: {
        user: 'User',
        password: 'New Password',
        checkpassword: 'Repeat Password',
        send: 'Change Password',
        cancel: 'Cancel'
      },
      validations: {
        newpassword: {
          required: 'Please input the password',
          pattern: 'Please use at least 8 chars, a-z A-Z, numbers and at least 1 special char.'
        },
        checkpassword: {
          required: 'Please input the password again',
          same: 'The two passwords must be the same.'
        }
      },
      notifications: {
        success_title: 'Password has been modified successfully.',
        error_title: 'Error modifying password',
        error_msg: 'An error has occurred, repeat the process again, or contact the administrator.'
      }
    }
  }
}
