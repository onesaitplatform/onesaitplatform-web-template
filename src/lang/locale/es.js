import esLocale from '@ods/ods/lib/locale/lang/es'

export default {
  ...esLocale,
  label: 'Español',
  labelMobile: 'ES',
  serverError: 'Ha ocurrido un error inesperado en el servidor. Inténtalo de nuevo.',

  breadcrumb: {
    home: 'Inicio',
    dashboard: 'Escritorio',
    tasks: 'Tareas',
    users: 'Usuarios',
    randomUser: 'Usuario random ',
    randomString: 'Random string param: ',
    editProfile: 'Editar mi perfil',
    myUser: 'Mi usuario',
    editUser: 'Editar usuario',
    userAccount: 'Cuenta de Usuario'
  },
  login: {
    title: 'Iniciar sesión',
    user: 'Nombre de usuario',
    password: 'Contraseña',
    submitButton: 'Enviar',
    rules: {
      user: 'Introduzca el usuario',
      password: 'Introduzca la contaseña'
    },
    logging: 'Iniciando sesión...',
    loginErrorTitle: 'Error de validación.',
    loginError: 'La combinación usuario/contraseña no es valida.',
    forgotPassword: '¿Has olvidado tu contraseña?',
    keepMeLogged: 'Mantener sesión iniciada',
    login: 'Entrar',
    footerLinks: ['faq', 'términos', 'condiciones'],
    social: {
      title: 'Haz login con'
    },
    register: {
      account: '¿No tienes cuenta todavía?',
      register: 'Regístrate'
    }
  },
  password: {
    title: 'Restablecer contraseña',
    message: 'Introduce una cuenta de correo electrónico vinculada al producto para continuar',
    email: 'Correo electrónico',
    submitButton: 'Enviar',
    goBack: 'Volver',
    error: 'Email no encontrado.',
    sending: 'Enviando...',
    rules: {
      email: 'Email no encontrado'
    },
    emailSubmitted: 'Hemos enviado un correo electrónico con instrucciones para poder restablecer su contraseña a:',
    done: 'Finalizar',
    emailError: 'No existe ninguna cuenta vinculada a este correo electrónico: '
  },
  notifications: {
    popoverTitle: 'Hi, there!'
  },
  header: {
    user: {
      profile: 'Perfil',
      account: 'Cuenta',
      theme: 'Seleccionar tema',
      logout: 'Salir'
    }
  },
  navigation: {
    home: 'Home',
    dashboards: 'Dashboards',
    userFavorite: 'Dashboard Favorito',
    satcm19_clie_diag_01_dmo_01_tpl_01: 'Clientes',
    UX_FINAL_GAGDETS: 'Dashboard UX',
    satcm19_prod_diag: 'Diagnosticos Producto',
    satcm19_prod_diag_01_dmo_01_tpl_01: 'Diagnostico Producto 01',
    satcm19_prod_diag_01_dmo_01_tpl_02: 'Diagnostico Producto 02',
    satcm19_rent_diag_01_dmo_01_tpl_01: 'Rentabilidad',
    satcm18_ccial_diag: 'Diagnosticos Comercial',
    satcm18_ccial_diag_01_dmo_01_tpl_01: 'Diagnostico Comercial 01',
    satcm18_ccial_diag_02_dmo_01_tpl_01: 'Diagnostico Comercial 02',
    satcm18_ccial_diag_03_dmo_01_tpl_01: 'Diagnostico Comercial 03',
    satcm18_ccial_diag_04_dmo_01_tpl_01: 'Diagnostico Comercial 04',
    satcm18_ccial_diag_05_dmo_01_tpl_01: 'Diagnostico Comercial 05',
    satcm18_ccial_diag_06_dmo_01_tpl_01: 'Diagnostico Comercial 06',
    satcm19_ccial_pred: 'Predictivos Comercial',
    satcm18_ccial_pred_01_dmo_01_tpl_01: 'Comercial Predictivo 01',
    satcm19_ccial_pred_02_dmo_02_tpl_01: 'Comercial Predictivo 02',
    satcm18_riesg_diag: 'Diagnosticos Riesgo',
    satcm18_riesg_diag_01_dmo_01_tpl_01: 'Riesgo Dashboard 01',
    satcm18_riesg_diag_02_dmo_01_tpl_01: 'Riesgo Dashboard 02',
    satcm18_riesg_diag_03_dmo_01_tpl_01: 'Riesgo Dashboard 03',
    satcm19_impg_diag_01_dmo_01_tpl_01: 'Impagos',
    satcm19_tarj_diag_01_dmo_01_tpl_01: 'Tarjetas',
    MDPago1: 'Negocios',
    MDPago2: 'Operaciones',
    MDPago3: 'Predictivo'
  },
  filters: {
    showhide: 'Mostrar/Ocultar Filtros',
    filters: 'Filtros',
    favorites: 'Favoritos',
    noFavorites: 'No hay Favoritos',
    favorites_search: 'Buscar favorito',
    entity: 'Entidad',
    entity_placeholder: 'Seleccionar Entidad',
    segment: 'Segmento',
    segment_placeholder: 'Seleccionar Segmento',
    product: 'Producto',
    product_placeholder: 'Seleccionar Producto',
    search: 'Buscar Gadgets y Dashboards',
    search_NoResults: 'No se han Encontrado Gadgets',
    save_dashboard: 'Guardar Dashboard'
  },
  user: {
    account: {
      header: 'Datos Personales',
      title: 'Cambio de Contraseña del usuario',
      info: 'Puede cambiar la contraseña , introduzca la nueva contraseña, y  envíe el formulario. Tras actualizarse le redireccionaremos a la página de donde venía. El siguiente login ya se hará con su nueva contraseña. Muchas gracias.',
      inputs: {
        user: 'Usuario',
        password: 'Nueva Contraseña',
        checkpassword: 'Repetir Contraseña',
        send: 'Cambiar Contraseña',
        cancel: 'Cancelar'
      },
      validations: {
        newpassword: {
          required: 'Nueva Contraseña es Requerida',
          pattern: 'Por favor la contraseña debe tener al menos 8 caracteres (A-Z, a-z, números) y al menos 1 caracter especial.'
        },
        checkpassword: {
          required: 'Repetir Contraseña es requerida',
          same: 'Las dos contraseñas deben ser iguales, tener el mismo valor.'
        }
      },
      notifications: {
        success_title: 'La Contraseña ha sido modificada con éxito.',
        error_title: 'Error al modificar la contraseña',
        error_msg: 'Se ha producido un error, Repita el proceso o contacte con el administrador.'
      }
    }
  }
}
