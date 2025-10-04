import i18next from 'i18next'

export const supportedLanguages = ['es', 'en', 'ca', 'fr'] as const
export type SupportedLanguage = typeof supportedLanguages[number]

const fallbackLanguage: SupportedLanguage = 'en'
const defaultLanguage: SupportedLanguage = 'es'

function isSupportedLanguage(language: string | undefined): language is SupportedLanguage {
  return supportedLanguages.includes(language as SupportedLanguage)
}

export const i18n = i18next.createInstance()

const resources = {
  es: {
    translation: {
      app: {
        title: "Gestor de Cumplimiento del AI Act",
        shortTitle: "AI Act CM",
        searchPlaceholder: "Buscar…",
        searchAria: "Buscar en la aplicación",
        greeting: "Hola",
        languageLabel: "Idioma",
        languageLabelShort: "LANG",
        languageSelectAria: "Seleccionar idioma",
        sidebarSubtitle: "Herramienta de seguimiento",
        appBarPrefix: "│ AppBar:",
        appBarLogo: "Logo",
        menuToggle: "Abrir menú",
        projectSelector: {
          title: "Proyecto activo",
          placeholder: "Seleccionar Proyecto",
          all: "Todos los proyectos",
          empty: "Sin proyectos activos",
          wizardDisabled: "No disponible durante la creación de un proyecto."
        },
        layout: {
          defaultProjectTitle: "Panel de control",
          selectProjectHint: "Selecciona un proyecto"
        },
        guestUser: "Invitado",
        noSession: "Sin sesión",
        logout: "Cerrar sesión",
        userMenu: {
          pendingActions: "Mis acciones pendientes",
          openMenu: "Abrir menú de usuario"
        },
        footer: {
          online: "Estado de conexión: Conectado",
          offline: "Estado de conexión: Sin conexión",
          version: "Versión: v{{version}}"
        }
      },
      nav: {
        dashboard: "Dashboard",
        projects: "Proyectos",
        risk: "Riesgo",
        incidents: "Incidentes",
        calendar: "Calendario",
        org: "Org & Roles",
        audit: "Auditoría",
        settings: "Ajustes",
        projectGroup: "Proyecto: {{name}}",
        project: {
          evidences: "Evidencias",
          teams: "Equipos",
          audits: "Auditorías",
          deliverables: "Entregables",
          calendar: "Calendario",
          org: "Org y Roles",
          audit: "Auditoría"
        }
      },
      auth: {
        fields: {
          company: "Empresa",
          email: "Correo electrónico",
          password: "Contraseña"
        },
        login: {
          title: "Inicia sesión",
          subtitle: "Accede al panel de cumplimiento con tus credenciales corporativas.",
          submit: "Entrar",
          or: "o",
          ssoButton: "Continuar con SSO corporativo",
          ssoHint: "El acceso SSO requiere una suscripción activa de tu organización.",
          ssoLabel: "SSO corporativo",
          noAccount: "¿Aún no tienes cuenta?",
          goToSignUp: "Crear una nueva cuenta"
        },
        signup: {
          title: "Crea tu cuenta",
          subtitle: "Registra tu equipo para comenzar a gestionar el cumplimiento.",
          fullName: "Nombre completo",
          company: "Empresa",
          email: "Correo electrónico",
          password: "Contraseña",
          passwordHelper: "Al menos 6 caracteres, una mayúscula y un carácter especial.",
          contactLabel: "Preferencia de contacto principal",
          contactEmail: "Correo de contacto",
          contactPhoneSms: "Número de móvil (SMS)",
          contactPhoneWhatsapp: "Número de WhatsApp",
          contactSlackUser: "Usuario o canal de Slack",
          slackWorkspace: "Workspace de Slack",
          slackChannel: "Canal o usuario",
          avatarLabel: "Avatar (opcional)",
          uploadAvatar: "Subir avatar",
          changeAvatar: "Cambiar avatar",
          submit: "Registrarme",
          hasAccount: "¿Ya tienes cuenta?",
          goToLogin: "Volver al login",
          language: "Idioma preferido",
          verificationTitle: "Verifica tu cuenta",
          verificationSubtitle: "Hemos enviado un código de verificación a {{email}}. Introdúcelo para completar el registro.",
          verificationCodeLabel: "Código de verificación",
          verifyButton: "Confirmar código",
          resendButton: "Enviar nuevo código",
          resendHelp: "Si no lo recibes, revisa tu carpeta de spam o solicita un nuevo código.",
          verificationMissing: "No se encontró el registro. Vuelve a iniciar el proceso.",
          verificationCodeRequired: "Introduce los 8 caracteres del código enviado.",
          verificationUnavailableTitle: "Verificación no disponible",
          verificationUnavailableSubtitle: "No encontramos un registro pendiente. Inicia un nuevo registro para continuar.",
          returnToRegistration: "Volver al registro",
          modifyDataPrompt: "¿Necesitas modificar tus datos?",
          editRegistration: "Editar registro"
        },
        contactMethods: {
          email: "Correo",
          sms: "SMS",
          whatsapp: "WhatsApp",
          slack: "Slack"
        },
        feedback: {
          loginSuccess: "Bienvenido/a de nuevo, {{name}}.",
          loginError: "No se pudo iniciar sesión con esas credenciales.",
          ssoSuccess: "Has accedido mediante {{provider}} como {{name}}.",
          ssoError: "El inicio de sesión SSO ha fallado.",
          signUpSuccess: "Registro completado para {{name}}.",
          signUpError: "No se pudo completar el registro.",
          signUpVerificationSent: "Hemos enviado un código de verificación a {{email}}.",
          signUpVerificationError: "El código de verificación no es válido o ha caducado.",
          signUpVerificationResent: "Se ha enviado un nuevo código a {{email}}.",
          signUpVerified: "Tu cuenta se ha verificado correctamente.",
          avatarError: "No se pudo cargar la imagen seleccionada."
        }
      },
      deliverables: {
        title: "Entregables del Proyecto",
        subtitle: "Gestiona la documentación obligatoria del proyecto seleccionado.",
        columns: {
          name: "Entregable",
          status: "Estado",
          version: "Versión",
          actions: "Acciones"
        },
        actions: {
          upload: "Subir",
          assign: "Asignar"
        },
        status: {
          open: "Abierto",
          inProgress: "En progreso",
          inReview: "En revisión",
          done: "Terminado"
        },
        assignModal: {
          title: "Asignar Entregable",
          assignee: "Asignar a",
          dueDate: "Fecha de entrega",
          placeholder: "Selecciona un contacto"
        }
      },
      languages: {
        es: { short: "ES", full: "Español" },
        en: { short: "EN", full: "English" },
        ca: { short: "CA", full: "Català" },
        fr: { short: "FR", full: "Français" }
      },
      common: {
        cancel: "Cancelar",
        send: "Enviar",
        back: "Atrás",
        next: "Siguiente",
        finish: "Finalizar",
        view: "Ver",
        loading: "Cargando…",
        notFound: "No encontrado",
        notAvailable: "N/D",
        remove: "Eliminar"
      },
      dashboard: {
        pageTitle: "Panel de control",
        pageSubtitle: "Resumen de indicadores de cumplimiento y actividad reciente.",
        metrics: {
          registeredProjects: "Proyectos registrados",
          registeredProjectsSubtitle: "3+ este mes",
          highRiskProjects: "Proyectos de alto riesgo",
          highRiskProjectsSubtitle: "12% del total",
          pendingEvidences: "Evidencias pendientes",
          pendingEvidencesSubtitle: "10 resueltas este mes",
          pendingTasks: "Tareas pendientes",
          pendingTasksSubtitle: "5 para esta semana",
          tasksPending_one: "{{count}} pendiente",
          tasksPending_other: "{{count}} pendientes"
        },
        riskOverview: {
          title: "Proyectos de IA por riesgo",
          subtitle: "Distribución de sistemas según clasificación de riesgo del Reglamento UE",
          levels: {
            high: "Alto riesgo",
            limited: "Riesgo limitado",
            minimal: "Riesgo mínimo"
          },
          systemsLabel_one: "{{count}} sistema",
          systemsLabel_other: "{{count}} sistemas",
          progressLabel: "{{level}}: {{percentage}}%"
        },
        timeline: {
          title: "Eventos recientes",
          subtitle: "Últimas actividades registradas",
          empty: "Sin eventos recientes",
          types: {
            riskAssessment: "Riesgo",
            incidentClosed: "Incidente",
            documentUpdated: "Documentación",
            taskCreated: "Workflow"
          },
          items: {
            riskAssessment: {
              title: "Evaluación de riesgo actualizada",
              description: "El sistema {{system}} se clasificó como {{risk}}"
            },
            incidentClosed: {
              title: "Incidente cerrado",
              description: "Caso {{incident}} resuelto por {{owner}}"
            },
            documentUpdated: {
              title: "Documentación actualizada",
              description: "Se publicó {{document}} para {{system}}"
            },
            taskCreated: {
              title: "Nueva tarea de cumplimiento",
              description: "{{task}} asignado al equipo de {{system}}"
            }
          }
        },
        actions: {
          title: "Acciones pendientes",
          subtitle: "Seguimiento de tareas clave",
          empty: "Sin acciones pendientes",
          columns: {
            task: "Acción",
            system: "Sistema",
            due: "Fecha",
            owner: "Responsable",
            status: "Estado",
            priority: "Prioridad"
          },
          status: {
            todo: "Pendiente",
            in_review: "En revisión",
            approved: "Aprobado"
          },
          priority: {
            high: "Alta",
            medium: "Media",
            low: "Baja"
          },
          items: {
            reviewRisk: "Revisar plan de mitigación para {{system}}",
            updateDossier: "Actualizar expediente técnico de {{system}}",
            scheduleAudit: "Programar auditoría interna de {{system}}",
            validateIncident: "Validar seguimiento del incidente en {{system}}"
          }
        }
      },

      calendarWorkflows: {
        title: "Calendario & Workflows",
        subtitle: "Consulta las tareas y hitos planificados para el proyecto {{project}}.",
        empty: "No hay tareas registradas para este proyecto.",
        task: {
          assignee: "Asignado a {{assignee}}",
          unassigned: "Sin asignar",
          due: "Fecha objetivo: {{date}}"
        },
        calendar: {
          title: "Próximos hitos",
          subtitle: "Eventos de cumplimiento para la semana en curso",
          legendTitle: "Tipos de evento",
          weekdays: {
            mon: "Lun",
            tue: "Mar",
            wed: "Mié",
            thu: "Jue",
            fri: "Vie"
          },
          eventTypes: {
            docRenewal: "DoC",
            auditPrep: "Auditoría",
            retrain: "Reentrenamiento"
          },
          events: {
            docRenewal: {
              title: "Renovación de DoC",
              description: "Actualizar documentación de {{system}}"
            },
            auditPrep: {
              title: "Preparación de auditoría",
              description: "Revisión de evidencias para {{system}}"
            },
            retrain: {
              title: "Reentrenamiento planificado",
              description: "Validar dataset de {{system}}"
            }
          }
        },
        workflows: {
          title: "Workflows activos",
          subtitle: "Tablero kanban de cumplimiento",
          columns: {
            backlog: "Backlog",
            inProgress: "En curso",
            review: "Revisión",
            done: "Completado"
          },
          priority: {
            high: "Alta",
            medium: "Media",
            low: "Baja"
          },
          items: {
            updateDataset: "Actualizar dataset de entrenamiento",
            incidentResponse: "Respuesta a incidente de {{system}}",
            legalReview: "Revisión legal de obligaciones",
            publishReport: "Publicar informe de cumplimiento"
          }
        }
      },
      orgRoles: {
        title: "Organización & roles",
        units: {
          title: "Unidades de negocio",
          description: "Responsables principales de cada ámbito regulatorio"
        },
        matrix: {
          title: "Matriz RACI por sistema",
          columns: {
            system: "Sistema",
            responsible: "R",
            accountable: "A",
            consulted: "C",
            informed: "I"
          }
        },
        contacts: {
          title: "Contactos clave",
          columns: {
            name: "Nombre",
            role: "Rol",
            email: "Correo",
            phone: "Teléfono"
          }
        },
        roles: {
          complianceLead: "Líder de cumplimiento",
          riskOwner: "Responsable de riesgos",
          legalAdvisor: "Asesor legal",
          dataSteward: "Data steward"
        }
      },
      auditEvidences: {
        pageTitle: "Evidencias de auditoría",
        pageSubtitle: "Estado de la documentación preparada para auditorías de cumplimiento del proyecto {{project}}.",
        summary: {
          totalDocuments: "Documentos",
          description: "Registros disponibles"
        },
        table: {
          columns: {
            name: "Nombre",
            status: "Estado",
            updated: "Última actualización"
          }
        },
        title: "Auditorías & evidencias",
        tabs: {
          audits: "Auditorías",
          evidences: "Evidencias"
        },
        audits: {
          upcomingTitle: "Próximas auditorías",
          columns: {
            name: "Auditoría",
            scope: "Ámbito",
            date: "Fecha",
            owner: "Responsable",
            status: "Estado"
          },
          status: {
            scheduled: "Programada",
            in_progress: "En curso",
            completed: "Completada"
          }
        },
        evidences: {
          tableTitle: "Repositorio de evidencias",
          columns: {
            id: "ID",
            type: "Tipo",
            system: "Sistema",
            updated: "Actualizado",
            owner: "Propietario"
          },
          types: {
            dataset: "Dataset",
            audit: "Auditoría",
            security: "Seguridad"
          }
        }
      },
      settings: {
        pageTitle: "Configuración",
        pageSubtitle: "Preferencias de cuenta y notificaciones personales.",
        title: "Ajustes de la aplicación",
        account: {
          title: "Cuenta",
          noSession: "Sin sesión activa",
          noCompany: "Organización no definida"
        },
        preferences: {
          title: "Preferencias",
          language: "Idioma de la interfaz",
          theme: "Tema",
          themeOptions: {
            light: "Claro",
            dark: "Oscuro"
          }
        },
        notifications: {
          title: "Notificaciones",
          channels: {
            email: "Correo electrónico",
            slack: "Slack",
            sms: "SMS"
          },
          items: {
            incidents: {
              label: "Alertas de incidentes",
              description: "Recibe un correo cuando se registre un nuevo incidente crítico."
            },
            deliverables: {
              label: "Recordatorios de entregables",
              description: "Avisos semanales de entregables próximos a vencer."
            },
            audits: {
              label: "Ejecución de auditorías",
              description: "Notificaciones sobre auditorías programadas y resultados."
            }
          }
        },
        integrations: {
          title: "Integraciones",
          apiKey: "Clave API",
          regenerate: "Regenerar"
        }
      },

      projects: {
        pageTitle: "Proyectos",
        pageSubtitle: "Gestiona los sistemas de IA y su documentación asociada.",
        actions: {
          newProject: "Nuevo proyecto"
        },
        filters: {
          role: {
            label: "Rol",
            all: "Todos"
          },
          risk: {
            label: "Riesgo",
            all: "Todos"
          },
          doc: {
            label: "Documentación",
            all: "Todas"
          },
          search: {
            label: "Buscar proyectos…",
            placeholder: "Nombre del proyecto"
          }
        },
        columns: {
          name: "Proyecto",
          role: "Rol",
          state: "Estado",
          risk: "Riesgo",
          docStatus: "DoC",
          lastAssessment: "Últ. evaluación",
          actions: "Acciones"
        },
        state: {
          labels: {
            initial: "Inicio",
            in_progress: "En curso",
            maintenance: "Mantenimiento"
          }
        },
        wizard: {
          title: "Asistente de Nuevo Proyecto",
          subtitle: "Recorre los pasos para crear un proyecto y registrar sus datos básicos.",
          addContact: "Añadir Contacto",
          steps: {
            details: "Detalles",
            team: "Equipo",
            riskAssessment: "Evaluación de Riesgo",
            summary: "Resumen"
          },
          help: {
            ariaLabel: "Mostrar ayuda del paso"
          },
          fields: {
            name: "Nombre del proyecto",
            role: "Rol en la cadena de valor",
            purpose: "Propósito del sistema",
            owner: "Propietario responsable",
            businessUnit: "Unidad de negocio (opcional)",
            deployments: "Despliegues previstos",
            team: "Miembros del equipo",
            risk: "Riesgo identificado",
            notes: "Notas adicionales"
          },
          contact: {
            name: "Nombre",
            role: "Rol",
            email: "Email",
            phone: "Teléfono",
            notification: "Método de aviso"
          },
          descriptions: {
            team: "Añade los contactos clave para este proyecto."
          },
          placeholders: {
            team: "p.ej. ada.lovelace@example.com, grace.hopper@example.com",
            notes: "Anotaciones sobre el alcance, el contexto o los próximos pasos...",
            businessUnit: "Unidad o departamento principal",
            purpose: "Describe la finalidad principal del sistema",
            owner: "Nombre de la persona responsable"
          },
          deployments: {
            helper: "Selecciona los entornos previstos para el despliegue.",
            options: {
              sandbox: "Sandbox / entorno controlado",
              pilot: "Piloto con usuarios reales",
              production: "Producción",
              internal_only: "Uso interno únicamente"
            }
          },
          risk: {
            description: "Selecciona la clasificación de riesgo identificada tras la evaluación inicial.",
            option: "Riesgo {{risk}}"
          },
          team: {
            empty: "Todavía no hay contactos asignados.",
            form: {
              title: "Añadir miembro del equipo",
              description: "Completa los datos y asigna responsabilidades RACI.",
              raciTitle: "Responsabilidades RACI",
              raciHelper: "Selecciona los roles que aplican a esta persona.",
              owner: "Owner del proyecto",
              reviewer: "Revisor/a",
              submit: "Agregar al equipo"
            },
            raci: {
              responsible: "Responsable (R)",
              accountable: "Aprobador (A)",
              consulted: "Consultado (C)",
              informed: "Informado (I)",
              none: "Sin asignar"
            },
            table: {
              responsibilities: "Responsabilidades",
              owner: "Owner",
              reviewer: "Revisor/a"
            },
            owner: {
              yes: "Sí",
              no: "No"
            },
            reviewer: {
              yes: "Sí",
              no: "No"
            },
            invites: {
              title: "Invitaciones pendientes",
              description: "Envía invitaciones por email para que completen su perfil.",
              placeholder: "persona@empresa.com",
              add: "Enviar invitación",
              empty: "Sin invitaciones pendientes",
              status: "Estado",
              pending: "Pendiente",
              remove: "Cancelar invitación",
              summaryLabel: "Invitaciones",
              summary: "{{count}} invitaciones pendientes"
            }
          },
          validations: {
            deployments: "Selecciona al menos un despliegue previsto."
          },
          summary: {
            title: "Resumen del Proyecto",
            contacts: "Contactos",
            teamCount: "{{count}} contactos",
            unset: "No definida",
            unclassifiedRisk: "Sin clasificar",
            justification: "Justificación",
            noNotes: "Sin notas"
          },
          finish: "Crear Proyecto"
        }
      },
      incidents: {
        pageTitle: "Incidentes",
        pageSubtitle: "Seguimiento de incidencias reportadas y su estado de revisión.",
        columns: {
          id: "ID",
          system: "Sistema",
          severity: "Severidad",
          status: "Estado",
          date: "Fecha",
          title: "Título"
        },
        empty: "No hay incidentes registrados para este contexto."
      },
      roles: {
        provider: "Proveedor",
        importer: "Importador",
        distributor: "Distribuidor",
        user: "Usuario"
      },
      riskLevels: {
        inaceptable: "Inaceptable",
        alto: "Alto",
        limitado: "Limitado",
        minimo: "Mínimo"
      },
      docStatus: {
        vigente: "Vigente",
        obsoleta: "Obsoleta",
        borrador: "Borrador",
        na: "N/A"
      },
      incident: {
        severity: {
          alta: "Alta",
          media: "Media",
          baja: "Baja"
        },
        status: {
          abierto: "Abierto",
          en_revision: "En revisión",
          cerrado: "Cerrado"
        }
      },
      systemDetail: {
        loading: "Cargando…",
        notFound: "No encontrado",
        identifier: "Identificador: {{id}}",
        stats: {
          role: "Rol",
          risk: "Riesgo",
          docStatus: "Estado documental"
        },
        chips: {
          role: "Rol: {{role}}",
          risk: "Riesgo: {{risk}}",
          doc: "DoC: {{doc}}"
        },
        actions: {
          reportIncident: "Reportar incidente"
        },
        alerts: {
          incidentReported: "Incidente reportado ({{id}})"
        },
        tabs: {
          overview: "Resumen",
          risk: "Riesgo",
          documentation: "Documentación",
          workflows: "Workflows",
          evidences: "Evidencias",
          history: "Historial"
        },
        content: {
          overview: "Metadatos y últimos cambios…",
          riskTitle: "Evaluaciones de riesgo",
          riskEmpty: "Sin evaluaciones aún.",
          documentation: "Expediente Técnico (secciones)…",
          workflows: "Kanban de cumplimiento…",
          evidences: "Evidencias adjuntas…",
          history: "Timeline de cambios…"
        },
        assessments: {
          title: "Evaluaciones de riesgo",
          empty: "Sin evaluaciones de riesgo registradas.",
          columns: {
            date: "Fecha",
            classification: "Clasificación",
            justification: "Justificación"
          }
        },
        dialog: {
          title: "Reportar incidente",
          fields: {
            title: "Título",
            severity: "Severidad",
            description: "Descripción"
          },
          actions: {
            cancel: "Cancelar",
            submit: "Enviar"
          }
        }
      },
      technicalDossier: {
        title: "Expediente Técnico (AI Act - Anexo IV)",
        actions: {
          sync: "Sincronizar con backend",
          syncSuccess: "Expediente sincronizado con backend (mock)"
        },
        sections: {
          general_info: {
            title: "Información general",
            fields: {
              system_name: "Nombre del sistema",
              provider: "Proveedor",
              contact: "Contacto responsable"
            }
          },
          description: {
            title: "Descripción del sistema",
            fields: {
              purpose: "Finalidad prevista",
              architecture: "Arquitectura técnica",
              lifecycle: "Ciclo de vida del desarrollo"
            }
          }
        }
      },
      riskWizard: {
        steps: {
          context: "Contexto",
          rights: "Derechos",
          biometric: "Biométrico",
          damage: "Daño",
          annexIII: "Anexo III",
          transparency: "Transparencia",
          result: "Resultado"
        },
        form: {
          yes: "Sí",
          no: "No",
          selectPlaceholder: "Selecciona una opción..."
        },
        result: {
          title: "Resultado de la Evaluación de Riesgo",
          classificationLabel: "Clasificación Sugerida",
          justification: "Justificación",
          implications: "Implicaciones",
          nextSteps: "Próximos Pasos"
        },
        results: {
          alto: {
            title: "Riesgo Alto",
            implications: "El sistema de IA se clasifica como de alto riesgo según el AI Act. Esto implica que está sujeto a requisitos legales estrictos antes y después de su puesta en el mercado, incluyendo evaluaciones de conformidad, registro en bases de datos de la UE y un sistema robusto de gestión de riesgos.",
            next_steps: [
              "Realizar una evaluación de conformidad completa según el Anexo VI.",
              "Registrar el sistema en la base de datos de la UE antes de su comercialización.",
              "Establecer un sistema de gestión de riesgos continuo.",
              "Garantizar una alta calidad y gobernanza de los datos de entrenamiento y prueba.",
              "Asegurar un nivel apropiado de supervisión humana y ciberseguridad."
            ]
          },
          limitado: {
            title: "Riesgo Limitado",
            implications: "El sistema presenta un riesgo limitado, principalmente relacionado con la transparencia. No se aplican los requisitos de los sistemas de alto riesgo, pero se deben cumplir obligaciones específicas para asegurar que los usuarios finales estén informados.",
            next_steps: [
              "Asegurar que los usuarios sean informados de que están interactuando con un sistema de IA (p.ej. en chatbots).",
              "Etiquetar de forma clara y visible el contenido generado o manipulado por la IA (p.ej. 'deep fakes').",
              "Evaluar periódicamente si los casos de uso del sistema podrían evolucionar hacia un riesgo mayor."
            ]
          },
          minimo: {
            title: "Riesgo Mínimo",
            implications: "El sistema se considera de riesgo mínimo o nulo. El AI Act no impone obligaciones legales para esta categoría, permitiendo su libre uso.",
            next_steps: [
              "Se recomienda la adhesión voluntaria a códigos de conducta para fomentar la confianza.",
              "Monitorizar el uso del sistema para detectar posibles nuevos riesgos no contemplados en la evaluación inicial.",
              "No se requieren acciones de cumplimiento obligatorias."
            ]
          }
        }
      },
      riskWizardDynamic: {
        steps: {
          context: "Contexto",
          biometric: "Identificación Biométrica",
          damage: "Posible daño",
          annexIII: "Anexo III",
          transparency: "Transparencia",
          result: "Resultado"
        },
        questions: {
          fundamental_rights: {
            text: "¿Sobre qué derechos fundamentales podría incidir el sistema?",
            options: {
              dignidad: "Dignidad",
              libertades: "Libertades",
              igualdad: "Igualdad",
              solidaridad: "Solidaridad",
              derechos_de_los_ciudadanos: "Derechos de los ciudadanos",
              justicia: "Justicia",
              ninguno_de_los_anteriores: "Ninguno de los anteriores"
            }
          },
          sector: {
            text: "Sector principal de uso",
            options: {
              salud: "Salud",
              educacion: "Educación",
              seguridad: "Seguridad",
              finanzas: "Finanzas",
              otros: "Otros"
            }
          },
          biometric_use: {
            text: "¿Qué tipo de sistema de identificación biométrica utiliza?",
            options: {
              identificación_biométrica_remota_en_tiempo_real: "Identificación biométrica remota 'en tiempo real'",
              identificación_biométrica_remota_a_posteriori: "Identificación biométrica remota 'a posteriori'",
              categorización_biométrica_basada_en_atributos_sensibles: "Categorización biométrica basada en atributos sensibles",
              reconocimiento_de_emociones: "Reconocimiento de emociones",
              extracción_no_selectiva_de_imágenes_faciales: "Extracción no selectiva de imágenes faciales",
              no_se_utiliza_ninguno_de_estos_sistemas: "No se utiliza ninguno de estos sistemas"
            }
          },
          harm_level: {
            text: "¿Qué tipos de daño podría causar el sistema?",
            options: {
              daño_grave_a_la_salud_o_integridad_física: "Daño grave a la salud o integridad física",
              daño_psicológico_significativo: "Daño psicológico significativo",
              perjuicio_económico_sustancial: "Perjuicio económico sustancial",
              daño_grave_al_medio_ambiente: "Daño grave al medio ambiente",
              interrupción_de_infraestructuras_críticas: "Interrupción de infraestructuras críticas",
              ninguno: "Ninguno"
            }
          },
          annex_sector: {
            text: "¿Se encuadra en alguno de los sectores del Anexo III?",
            options: {
              empleo: "Empleo",
              credito: "Crédito",
              educacion: "Educación",
              sanidad: "Sanidad",
              policia_judicial: "Policía/Judicial",
              no_aplica_a_ninguno_de_estos_sectores: "No aplica a ninguno de estos sectores"
            }
          },
          human_disclosure: {
            text: "¿El sistema informa claramente cuando interactúa una IA?"
          },
          human_disclosure_method: {
            text: "Por favor, describe el método utilizado para informar:"
          }
        },
        rules: {
          biometric_use: "Uso de un sistema de identificación biométrica considerado de alto riesgo.",
          annex_sector: "Ámbito regulado por Anexo III",
          harm_level_high: "El sistema puede causar un tipo de daño considerado de alto riesgo.",
          fundamental_rights: "El sistema puede afectar a derechos fundamentales.",
          default: "No se identificaron factores de alto riesgo"
        }
      },
      placeholders: {
        auditEvidences: "Vista Auditoría & Evidencias (placeholder)",
        calendarWorkflows: "Vista Calendario & Workflows (placeholder)",
        orgRoles: "Vista Org & Roles (placeholder)",
        settings: "Vista Ajustes (placeholder)"
      }
    }
  },
  en: {
    translation: {
      app: {
        title: "AI Act Compliance Manager",
        shortTitle: "AI Act CM",
        searchPlaceholder: "Search…",
        searchAria: "Search across the application",
        greeting: "Hello",
        languageLabel: "Language",
        languageLabelShort: "LANG",
        languageSelectAria: "Select language",
        sidebarSubtitle: "Monitoring toolkit",
        appBarPrefix: "│ AppBar:",
        appBarLogo: "Logo",
        menuToggle: "Open menu",
        projectSelector: {
          title: "Active project",
          placeholder: "Select project",
          all: "All projects",
          empty: "No active projects",
          wizardDisabled: "Disabled while creating a new project."
        },
        layout: {
          defaultProjectTitle: "Dashboard",
          selectProjectHint: "Select a project"
        },
        guestUser: "Guest",
        noSession: "No session",
        logout: "Sign out",
        userMenu: {
          pendingActions: "My pending actions",
          openMenu: "Open user menu"
        },
        footer: {
          online: "Connection status: Online",
          offline: "Connection status: Offline",
          version: "Version: v{{version}}"
        }
      },
      nav: {
        dashboard: "Dashboard",
        projects: "Projects",
        risk: "Risk",
        incidents: "Incidents",
        calendar: "Calendar",
        org: "Org & Roles",
        audit: "Audit",
        settings: "Settings",
        projectGroup: "Project: {{name}}",
        project: {
          evidences: "Evidence",
          teams: "Teams",
          audits: "Audits",
          deliverables: "Deliverables",
          calendar: "Calendar",
          org: "Org & Roles",
          audit: "Audit"
        }
      },
      auth: {
        fields: {
          company: "Company",
          email: "Email",
          password: "Password"
        },
        login: {
          title: "Sign in",
          subtitle: "Access the compliance workspace with your corporate credentials.",
          submit: "Sign in",
          or: "or",
          ssoButton: "Continue with corporate SSO",
          ssoHint: "Corporate SSO requires an active subscription from your organization.",
          ssoLabel: "Corporate SSO",
          noAccount: "Don't have an account yet?",
          goToSignUp: "Create a new account"
        },
        signup: {
          title: "Create your account",
          subtitle: "Register your team to start managing AI Act compliance.",
          fullName: "Full name",
          company: "Company",
          email: "Work email",
          password: "Password",
          passwordHelper: "At least 6 characters, one uppercase letter and one special character.",
          contactLabel: "Preferred contact method",
          contactEmail: "Contact email",
          contactPhoneSms: "Mobile number (SMS)",
          contactPhoneWhatsapp: "WhatsApp number",
          contactSlackUser: "Slack user or channel",
          slackWorkspace: "Slack workspace",
          slackChannel: "Channel or user",
          avatarLabel: "Avatar (optional)",
          uploadAvatar: "Upload avatar",
          changeAvatar: "Change avatar",
          submit: "Create account",
          hasAccount: "Already have an account?",
          goToLogin: "Back to login",
          language: "Preferred language",
          verificationTitle: "Verify your account",
          verificationSubtitle: "We sent a verification code to {{email}}. Enter it below to finish your registration.",
          verificationCodeLabel: "Verification code",
          verifyButton: "Confirm code",
          resendButton: "Send new code",
          resendHelp: "Didn't receive it? Check your spam folder or request another code.",
          verificationMissing: "We couldn't find the registration. Please start again.",
          verificationCodeRequired: "Enter the 8 characters of the verification code.",
          verificationUnavailableTitle: "Verification unavailable",
          verificationUnavailableSubtitle: "We couldn't find a pending registration. Start a new registration to continue.",
          returnToRegistration: "Back to registration",
          modifyDataPrompt: "Need to update your details?",
          editRegistration: "Edit registration"
        },
        contactMethods: {
          email: "Email",
          sms: "SMS",
          whatsapp: "WhatsApp",
          slack: "Slack"
        },
        feedback: {
          loginSuccess: "Welcome back, {{name}}.",
          loginError: "We couldn't sign you in with those credentials.",
          ssoSuccess: "Signed in with {{provider}} as {{name}}.",
          ssoError: "SSO sign-in failed.",
          signUpSuccess: "Registration completed for {{name}}.",
          signUpError: "We couldn't finish the registration.",
          signUpVerificationSent: "We've sent a verification code to {{email}}.",
          signUpVerificationError: "The verification code is invalid or has expired.",
          signUpVerificationResent: "A new verification code was sent to {{email}}.",
          signUpVerified: "Your account has been verified successfully.",
          avatarError: "We couldn't process the selected image."
        }
      },
      deliverables: {
        title: "Project Deliverables",
        subtitle: "Manage the mandatory documentation for the selected project.",
        columns: {
          name: "Deliverable",
          status: "Status",
          version: "Version",
          actions: "Actions"
        },
        actions: {
          upload: "Upload",
          assign: "Assign"
        },
        status: {
          open: "Open",
          inProgress: "In progress",
          inReview: "Under review",
          done: "Completed"
        },
        assignModal: {
          title: "Assign Deliverable",
          assignee: "Assign to",
          dueDate: "Due date",
          placeholder: "Select a contact"
        }
      },
      calendarWorkflows: {
        title: "Calendar & workflows",
        subtitle: "Review scheduled tasks and milestones for project {{project}}.",
        empty: "No tasks recorded for this project.",
        task: {
          assignee: "Assigned to {{assignee}}",
          unassigned: "Unassigned",
          due: "Target date: {{date}}"
        }
      },
      settings: {
        pageTitle: "Settings",
        pageSubtitle: "Account preferences and personal notifications.",
        title: "Application settings",
        account: {
          title: "Account",
          noSession: "No active session",
          noCompany: "Organization not defined"
        },
        preferences: {
          title: "Preferences",
          language: "Interface language",
          theme: "Theme",
          themeOptions: {
            light: "Light",
            dark: "Dark"
          }
        },
        notifications: {
          title: "Notifications",
          channels: {
            email: "Email",
            slack: "Slack",
            sms: "SMS"
          },
          items: {
            incidents: {
              label: "Incident alerts",
              description: "Get an email whenever a critical incident is logged."
            },
            deliverables: {
              label: "Deliverable reminders",
              description: "Weekly reminders for deliverables nearing their deadline."
            },
            audits: {
              label: "Audit execution",
              description: "Notifications about scheduled audits and results."
            }
          }
        },
        integrations: {
          title: "Integrations",
          apiKey: "API key",
          regenerate: "Regenerate"
        }
      },
      languages: {
        es: { short: "ES", full: "Spanish" },
        en: { short: "EN", full: "English" },
        ca: { short: "CA", full: "Catalan" },
        fr: { short: "FR", full: "French" }
      },
      common: {
        cancel: "Cancel",
        send: "Send",
        back: "Back",
        next: "Next",
        finish: "Finish",
        view: "View",
        loading: "Loading…",
        notFound: "Not found",
        notAvailable: "N/A",
        remove: "Remove"
      },
      dashboard: {
        pageTitle: "Dashboard",
        pageSubtitle: "Summary of compliance indicators and recent activity.",
        metrics: {
          registeredProjects: "Registered projects",
          registeredProjectsSubtitle: "3+ this month",
          highRiskProjects: "High-risk projects",
          highRiskProjectsSubtitle: "12% of total",
          pendingEvidences: "Pending evidence",
          pendingEvidencesSubtitle: "10 resolved this month",
          pendingTasks: "Pending tasks",
          pendingTasksSubtitle: "5 due this week",
          tasksPending_one: "{{count}} pending task",
          tasksPending_other: "{{count}} pending tasks"
        },
        riskOverview: {
          title: "AI projects by risk",
          subtitle: "Distribution of systems by EU AI Act risk classification",
          levels: {
            high: "High risk",
            limited: "Limited risk",
            minimal: "Minimal risk"
          },
          systemsLabel_one: "{{count}} system",
          systemsLabel_other: "{{count}} systems",
          progressLabel: "{{level}}: {{percentage}}%"
        },
        timeline: {
          title: "Recent activity",
          subtitle: "Latest recorded updates",
          empty: "No recent events",
          types: {
            riskAssessment: "Risk",
            incidentClosed: "Incident",
            documentUpdated: "Documentation",
            taskCreated: "Workflow"
          },
          items: {
            riskAssessment: {
              title: "Risk assessment updated",
              description: "System {{system}} classified as {{risk}}"
            },
            incidentClosed: {
              title: "Incident closed",
              description: "Case {{incident}} resolved by {{owner}}"
            },
            documentUpdated: {
              title: "Documentation updated",
              description: "{{document}} published for {{system}}"
            },
            taskCreated: {
              title: "New compliance task",
              description: "{{task}} assigned to the {{system}} team"
            }
          }
        },
        actions: {
          title: "Pending actions",
          subtitle: "Key follow-up items",
          empty: "No pending actions",
          columns: {
            task: "Action",
            system: "System",
            due: "Due date",
            owner: "Owner",
            status: "Status",
            priority: "Priority"
          },
          status: {
            todo: "To do",
            in_review: "In review",
            approved: "Approved"
          },
          priority: {
            high: "High",
            medium: "Medium",
            low: "Low"
          },
          items: {
            reviewRisk: "Review mitigation plan for {{system}}",
            updateDossier: "Update technical dossier for {{system}}",
            scheduleAudit: "Schedule internal audit for {{system}}",
            validateIncident: "Validate incident follow-up in {{system}}"
          }
        }
      },
      projects: {
        pageTitle: "Projects",
        pageSubtitle: "Manage AI systems and their associated documentation.",
        actions: {
          newProject: "New project"
        },
        filters: {
          role: {
            label: "Role",
            all: "All"
          },
          risk: {
            label: "Risk",
            all: "All"
          },
          doc: {
            label: "Documentation",
            all: "All"
          },
          search: {
            label: "Search projects…",
            placeholder: "Project name"
          }
        },
        columns: {
          name: "Project",
          role: "Role",
          state: "Status",
          risk: "Risk",
          docStatus: "DoC",
          lastAssessment: "Last assessment",
          actions: "Actions"
        },
        state: {
          labels: {
            initial: "Kick-off",
            in_progress: "In progress",
            maintenance: "Maintenance"
          }
        },
        wizard: {
          title: "New Project Wizard",
          subtitle: "Follow the steps to create a project and capture its core data.",
          addContact: "Add Contact",
          steps: {
            details: "Details",
            team: "Team",
            riskAssessment: "Risk Assessment",
            summary: "Summary"
          },
          help: {
            ariaLabel: "Show step help"
          },
          fields: {
            name: "Project name",
            role: "Role in the value chain",
            purpose: "System purpose",
            owner: "Project owner",
            businessUnit: "Business unit (optional)",
            deployments: "Planned deployments",
            team: "Team members",
            risk: "Identified risk",
            notes: "Additional notes"
          },
          contact: {
            name: "Name",
            role: "Role",
            email: "Email",
            phone: "Phone",
            notification: "Notification method"
          },
          descriptions: {
            team: "Add the key contacts for this project."
          },
          placeholders: {
            team: "e.g. ada.lovelace@example.com, grace.hopper@example.com",
            notes: "Notes about scope, context, or next steps...",
            businessUnit: "Primary unit or department",
            purpose: "Describe the primary intended purpose",
            owner: "Name of the accountable owner"
          },
          deployments: {
            helper: "Select the environments where the system will be deployed.",
            options: {
              sandbox: "Sandbox / controlled environment",
              pilot: "Pilot with real users",
              production: "Production",
              internal_only: "Internal use only"
            }
          },
          risk: {
            description: "Select the risk classification identified after the initial assessment.",
            option: "{{risk}} risk"
          },
          team: {
            empty: "No contacts added yet.",
            form: {
              title: "Add team member",
              description: "Fill in the details and assign RACI responsibilities.",
              raciTitle: "RACI responsibilities",
              raciHelper: "Select the roles that apply to this person.",
              owner: "Project owner",
              reviewer: "Reviewer",
              submit: "Add to team"
            },
            raci: {
              responsible: "Responsible (R)",
              accountable: "Accountable (A)",
              consulted: "Consulted (C)",
              informed: "Informed (I)",
              none: "Not assigned"
            },
            table: {
              responsibilities: "Responsibilities",
              owner: "Owner",
              reviewer: "Reviewer"
            },
            owner: {
              yes: "Yes",
              no: "No"
            },
            reviewer: {
              yes: "Yes",
              no: "No"
            },
            invites: {
              title: "Pending invitations",
              description: "Send invitations by email so they can complete their profile.",
              placeholder: "person@example.com",
              add: "Send invitation",
              empty: "No pending invitations",
              status: "Status",
              pending: "Pending",
              remove: "Cancel invitation",
              summaryLabel: "Invites",
              summary: "{{count}} pending invitations"
            }
          },
          validations: {
            deployments: "Select at least one planned deployment."
          },
          summary: {
            title: "Project Summary",
            contacts: "Contacts",
            teamCount: "{{count}} contacts",
            unset: "Not defined",
            unclassifiedRisk: "Unclassified",
            justification: "Justification",
            noNotes: "No notes"
          },
          finish: "Create Project"
        }
      },
      incidents: {
        pageTitle: "Incidents",
        pageSubtitle: "Track reported incidents and their review status.",
        columns: {
          id: "ID",
          system: "System",
          severity: "Severity",
          status: "Status",
          date: "Date",
          title: "Title"
        },
        empty: "No incidents recorded for this context."
      },
      roles: {
        provider: "Provider",
        importer: "Importer",
        distributor: "Distributor",
        user: "User"
      },
      riskLevels: {
        inaceptable: "Unacceptable",
        alto: "High",
        limitado: "Limited",
        minimo: "Minimal"
      },
      docStatus: {
        vigente: "Current",
        obsoleta: "Obsolete",
        borrador: "Draft",
        na: "N/A"
      },
      incident: {
        severity: {
          alta: "High",
          media: "Medium",
          baja: "Low"
        },
        status: {
          abierto: "Open",
          en_revision: "In review",
          cerrado: "Closed"
        }
      },
      systemDetail: {
        loading: "Loading…",
        notFound: "Not found",
        identifier: "Identifier: {{id}}",
        stats: {
          role: "Role",
          risk: "Risk",
          docStatus: "Documentation status"
        },
        chips: {
          role: "Role: {{role}}",
          risk: "Risk: {{risk}}",
          doc: "DoC: {{doc}}"
        },
        actions: {
          reportIncident: "Report incident"
        },
        alerts: {
          incidentReported: "Incident reported ({{id}})"
        },
        tabs: {
          overview: "Overview",
          risk: "Risk",
          documentation: "Documentation",
          workflows: "Workflows",
          evidences: "Evidence",
          history: "History"
        },
        content: {
          overview: "Metadata and latest updates…",
          riskTitle: "Risk assessments",
          riskEmpty: "No assessments yet.",
          documentation: "Technical dossier sections…",
          workflows: "Compliance kanban…",
          evidences: "Attached evidence…",
          history: "Change timeline…"
        },
        assessments: {
          title: "Risk assessments",
          empty: "No recorded risk assessments.",
          columns: {
            date: "Date",
            classification: "Classification",
            justification: "Justification"
          }
        },
        dialog: {
          title: "Report incident",
          fields: {
            title: "Title",
            severity: "Severity",
            description: "Description"
          },
          actions: {
            cancel: "Cancel",
            submit: "Send"
          }
        }
      },
      technicalDossier: {
        title: "Technical Dossier (AI Act - Annex IV)",
        actions: {
          sync: "Sync with backend",
          syncSuccess: "Technical dossier synced with backend (mock)"
        },
        sections: {
          general_info: {
            title: "General information",
            fields: {
              system_name: "System name",
              provider: "Provider",
              contact: "Responsible contact"
            }
          },
          description: {
            title: "System description",
            fields: {
              purpose: "Intended purpose",
              architecture: "Technical architecture",
              lifecycle: "Development lifecycle"
            }
          }
        }
      },
      riskWizard: {
        steps: {
          context: "Context",
          rights: "Rights",
          biometric: "Biometric",
          damage: "Harm",
          annexIII: "Annex III",
          transparency: "Transparency",
          result: "Result"
        },
        form: {
          yes: "Yes",
          no: "No",
          selectPlaceholder: "Select an option..."
        },
        result: {
          title: "Risk Assessment Result",
          classificationLabel: "Suggested Classification",
          justification: "Justification",
          implications: "Implications",
          nextSteps: "Next Steps"
        },
        results: {
          alto: {
            title: "High Risk",
            implications: "The AI system is classified as high-risk under the AI Act. This means it is subject to strict legal requirements before and after being placed on the market, including conformity assessments, EU database registration, and a robust risk management system.",
            next_steps: [
              "Conduct a full conformity assessment as per Annex VI.",
              "Register the system in the EU database before market entry.",
              "Establish a continuous risk management system.",
              "Ensure high-quality data governance for training and testing data.",
              "Ensure appropriate levels of human oversight and cybersecurity."
            ]
          },
          limitado: {
            title: "Limited Risk",
            implications: "The system presents a limited risk, primarily related to transparency. The requirements for high-risk systems do not apply, but specific obligations must be met to ensure end-users are informed.",
            next_steps: [
              "Ensure users are informed they are interacting with an AI system (e.g., in chatbots).",
              "Clearly and visibly label AI-generated or manipulated content (e.g., 'deep fakes').",
              "Periodically assess whether the system's use cases could evolve into a higher risk category."
            ]
          },
          minimo: {
            title: "Minimal Risk",
            implications: "The system is considered to have minimal or no risk. The AI Act does not impose legal obligations for this category, allowing for its free use.",
            next_steps: [
              "Voluntary adherence to codes of conduct is recommended to foster trust.",
              "Monitor the system's use to detect potential new risks not covered in the initial assessment.",
              "No mandatory compliance actions are required."
            ]
          }
        }
      },
      riskWizardDynamic: {
        steps: {
          context: "Context",
          biometric: "Biometric identification",
          damage: "Potential harm",
          annexIII: "Annex III",
          transparency: "Transparency",
          result: "Result"
        },
        questions: {
          fundamental_rights: {
            text: "Which fundamental rights could the system impact?",
            options: {
              dignidad: "Dignity",
              libertades: "Freedoms",
              igualdad: "Equality",
              solidaridad: "Solidarity",
              derechos_de_los_ciudadanos: "Citizens' Rights",
              justicia: "Justice",
              ninguno_de_los_anteriores: "None of the above"
            }
          },
          sector: {
            text: "Primary sector of use",
            options: {
              salud: "Health",
              educacion: "Education",
              seguridad: "Security",
              finanzas: "Finance",
              otros: "Others"
            }
          },
          biometric_use: {
            text: "What type of biometric identification system does it use?",
            options: {
              identificación_biométrica_remota_en_tiempo_real: "'Real-time' remote biometric identification",
              identificación_biométrica_remota_a_posteriori: "'Post' remote biometric identification",
              categorización_biométrica_basada_en_atributos_sensibles: "Biometric categorization based on sensitive attributes",
              reconocimiento_de_emociones: "Emotion recognition",
              extracción_no_selectiva_de_imágenes_faciales: "Untargeted scraping of facial images",
              no_se_utiliza_ninguno_de_estos_sistemas: "None of these systems are used"
            }
          },
          harm_level: {
            text: "What types of harm could the system cause?",
            options: {
              daño_grave_a_la_salud_o_integridad_física: "Serious harm to health or physical integrity",
              daño_psicológico_significativo: "Significant psychological harm",
              perjuicio_económico_sustancial: "Substantial economic loss",
              daño_grave_al_medio_ambiente: "Serious harm to the environment",
              interrupción_de_infraestructuras_críticas: "Disruption of critical infrastructure",
              ninguno: "None"
            }
          },
          annex_sector: {
            text: "Does it fall under any Annex III sectors?",
            options: {
              empleo: "Employment",
              credito: "Credit",
              educacion: "Education",
              sanidad: "Healthcare",
              policia_judicial: "Law enforcement / judicial",
              no_aplica_a_ninguno_de_estos_sectores: "Does not apply to any of these sectors"
            }
          },
          human_disclosure: {
            text: "Does the system clearly disclose AI interactions?"
          },
          human_disclosure_method: {
            text: "Please describe the method used for disclosure:"
          }
        },
        rules: {
          biometric_use: "Use of a biometric identification system considered high-risk.",
          annex_sector: "Area regulated by Annex III",
          harm_level_high: "The system may cause a type of harm considered high-risk.",
          fundamental_rights: "The system may affect fundamental rights.",
          default: "No high-risk factors detected"
        }
      },
      placeholders: {
        auditEvidences: "Audit & Evidence view (placeholder)",
        calendarWorkflows: "Calendar & Workflows view (placeholder)",
        orgRoles: "Org & Roles view (placeholder)",
        settings: "Settings view (placeholder)"
      }
    }
  },
  ca: {
    translation: {
      app: {
        title: "Gestor de compliment de l'AI Act",
        shortTitle: "AI Act CM",
        searchPlaceholder: "Cerca…",
        searchAria: "Cerca a l'aplicació",
        greeting: "Hola",
        languageLabel: "Llengua",
        languageLabelShort: "LANG",
        languageSelectAria: "Selecciona llengua",
        sidebarSubtitle: "Eina de seguiment",
        appBarPrefix: "│ AppBar:",
        appBarLogo: "Logo",
        menuToggle: "Obrir menú",
        projectSelector: {
          title: "Projecte actiu",
          placeholder: "Seleccionar projecte",
          all: "Tots els projectes",
          empty: "Sense projectes actius",
          wizardDisabled: "No es pot canviar mentre crees un projecte nou."
        },
        layout: {
          defaultProjectTitle: "Quadre de comandament",
          selectProjectHint: "Selecciona un projecte"
        },
        guestUser: "Convidat",
        noSession: "Sense sessió",
        logout: "Tanca la sessió",
        userMenu: {
          pendingActions: "Les meves accions pendents",
          openMenu: "Obre el menú d'usuari"
        },
        footer: {
          online: "Estat de connexió: Connectat",
          offline: "Estat de connexió: Sense connexió",
          version: "Versió: v{{version}}"
        }
      },
      nav: {
        dashboard: "Panell",
        projects: "Projectes",
        risk: "Risc",
        incidents: "Incidents",
        calendar: "Calendari",
        org: "Org. i rols",
        audit: "Auditoria",
        settings: "Configuració",
        projectGroup: "Projecte: {{name}}",
        project: {
          evidences: "Evidències",
          teams: "Equips",
          audits: "Auditories",
          deliverables: "Lliurables",
          calendar: "Calendari",
          org: "Org i Rols",
          audit: "Auditoria"
        }
      },
      auth: {
        fields: {
          company: "Empresa",
          email: "Correu electrònic",
          password: "Contrasenya"
        },
        login: {
          title: "Inicia sessió",
          subtitle: "Accedeix a l'entorn de compliment amb les teves credencials corporatives.",
          submit: "Entrar",
          or: "o",
          ssoButton: "Continua amb SSO corporatiu",
          ssoHint: "L'SSO corporatiu requereix una subscripció activa de l'organització.",
          ssoLabel: "SSO corporatiu",
          noAccount: "Encara no tens compte?",
          goToSignUp: "Crear un nou compte"
        },
        signup: {
          title: "Crea el teu compte",
          subtitle: "Registra el teu equip per començar a gestionar el compliment de l'AI Act.",
          fullName: "Nom complet",
          company: "Empresa",
          email: "Correu electrònic",
          password: "Contrasenya",
          passwordHelper: "Mínim 6 caràcters, una majúscula i un caràcter especial.",
          contactLabel: "Mètode de contacte preferit",
          contactEmail: "Correu de contacte",
          contactPhoneSms: "Número mòbil (SMS)",
          contactPhoneWhatsapp: "Número de WhatsApp",
          contactSlackUser: "Usuari o canal de Slack",
          slackWorkspace: "Workspace de Slack",
          slackChannel: "Canal o usuari",
          avatarLabel: "Avatar (opcional)",
          uploadAvatar: "Puja un avatar",
          changeAvatar: "Canvia l'avatar",
          submit: "Registrar-me",
          hasAccount: "Ja tens compte?",
          goToLogin: "Torna al login",
          language: "Llengua preferida",
          verificationTitle: "Verifica el teu compte",
          verificationSubtitle: "Hem enviat un codi de verificació a {{email}}. Introdueix-lo per completar el registre.",
          verificationCodeLabel: "Codi de verificació",
          verifyButton: "Confirmar codi",
          resendButton: "Enviar un nou codi",
          resendHelp: "Si no el reps, revisa el correu brossa o sol·licita un nou codi.",
          verificationMissing: "No s'ha trobat el registre. Torna a iniciar el procés.",
          verificationCodeRequired: "Introdueix els 8 caràcters del codi enviat.",
          verificationUnavailableTitle: "Verificació no disponible",
          verificationUnavailableSubtitle: "No hem trobat cap registre pendent. Inicia un nou registre per continuar.",
          returnToRegistration: "Torna al registre",
          modifyDataPrompt: "Necessites modificar les teves dades?",
          editRegistration: "Edita el registre"
        },
        contactMethods: {
          email: "Correu",
          sms: "SMS",
          whatsapp: "WhatsApp",
          slack: "Slack"
        },
        feedback: {
          loginSuccess: "Benvingut/da de nou, {{name}}.",
          loginError: "No s'ha pogut iniciar sessió amb aquestes credencials.",
          ssoSuccess: "Sessió iniciada amb {{provider}} com a {{name}}.",
          ssoError: "Error en l'inici de sessió SSO.",
          signUpSuccess: "Registre completat per {{name}}.",
          signUpError: "No s'ha pogut completar el registre.",
          signUpVerificationSent: "Hem enviat un codi de verificació a {{email}}.",
          signUpVerificationError: "El codi de verificació no és vàlid o ha caducat.",
          signUpVerificationResent: "S'ha enviat un nou codi a {{email}}.",
          signUpVerified: "El teu compte s'ha verificat correctament.",
          avatarError: "No s'ha pogut carregar la imatge seleccionada."
        }
      },
      deliverables: {
        title: "Lliurables del Projecte",
        subtitle: "Gestiona la documentació obligatòria del projecte seleccionat.",
        columns: {
          name: "Lliurable",
          status: "Estat",
          version: "Versió",
          actions: "Accions"
        },
        actions: {
          upload: "Puja",
          assign: "Assigna"
        },
        status: {
          open: "Obert",
          inProgress: "En progrés",
          inReview: "En revisió",
          done: "Completat"
        },
        assignModal: {
          title: "Assignar Lliurable",
          assignee: "Assignar a",
          dueDate: "Data de lliurament",
          placeholder: "Selecciona un contacte"
        }
      },
      calendarWorkflows: {
        title: "Calendari i workflows",
        subtitle: "Consulta les tasques i fites planificades per al projecte {{project}}.",
        empty: "No hi ha tasques registrades per a aquest projecte.",
        task: {
          assignee: "Assignat a {{assignee}}",
          unassigned: "Sense assignar",
          due: "Data objectiu: {{date}}"
        }
      },
      settings: {
        pageTitle: "Configuració",
        pageSubtitle: "Preferències de compte i notificacions personals.",
        title: "Ajustos de l'aplicació",
        account: {
          title: "Compte",
          noSession: "Sense sessió activa",
          noCompany: "Organització no definida"
        },
        preferences: {
          title: "Preferències",
          language: "Llengua de la interfície",
          theme: "Tema",
          themeOptions: {
            light: "Clar",
            dark: "Fosc"
          }
        },
        notifications: {
          title: "Notificacions",
          channels: {
            email: "Correu electrònic",
            slack: "Slack",
            sms: "SMS"
          },
          items: {
            incidents: {
              label: "Alertes d'incidents",
              description: "Rep un correu quan es registri un incident crític."
            },
            deliverables: {
              label: "Recordatoris de lliurables",
              description: "Avisos setmanals de lliurables propers a vèncer."
            },
            audits: {
              label: "Execució d'auditories",
              description: "Notificacions sobre auditories programades i resultats."
            }
          }
        },
        integrations: {
          title: "Integracions",
          apiKey: "Clau API",
          regenerate: "Regenera"
        }
      },
      languages: {
        es: { short: "ES", full: "Espanyol" },
        en: { short: "EN", full: "Anglès" },
        ca: { short: "CA", full: "Català" },
        fr: { short: "FR", full: "Francès" }
      },
      common: {
        cancel: "Cancel·la",
        send: "Envia",
        back: "Enrere",
        next: "Següent",
        finish: "Finalitza",
        view: "Veure",
        loading: "Carregant…",
        notFound: "No s'ha trobat",
        notAvailable: "N/D",
        remove: "Elimina"
      },
      dashboard: {
        pageTitle: "Quadre de control",
        pageSubtitle: "Resum d'indicadors de compliment i activitat recent.",
        metrics: {
          registeredProjects: "Projectes registrats",
          registeredProjectsSubtitle: "3+ aquest mes",
          highRiskProjects: "Projectes d'alt risc",
          highRiskProjectsSubtitle: "12% del total",
          pendingEvidences: "Evidències pendents",
          pendingEvidencesSubtitle: "10 resoltes aquest mes",
          pendingTasks: "Tasques pendents",
          pendingTasksSubtitle: "5 per a aquesta setmana",
          tasksPending_one: "{{count}} tasca pendent",
          tasksPending_other: "{{count}} tasques pendents"
        },
        riskOverview: {
          title: "Projectes d'IA per risc",
          subtitle: "Distribució de sistemes segons la classificació de risc del Reglament UE",
          levels: {
            high: "Alt risc",
            limited: "Risc limitat",
            minimal: "Risc mínim"
          },
          systemsLabel_one: "{{count}} sistema",
          systemsLabel_other: "{{count}} sistemes",
          progressLabel: "{{level}}: {{percentage}}%"
        },
        timeline: {
          title: "Activitat recent",
          subtitle: "Darreres actualitzacions registrades",
          empty: "Sense esdeveniments recents",
          types: {
            riskAssessment: "Risc",
            incidentClosed: "Incident",
            documentUpdated: "Documentació",
            taskCreated: "Workflow"
          },
          items: {
            riskAssessment: {
              title: "Avaluació de risc actualitzada",
              description: "El sistema {{system}} s'ha classificat com {{risk}}"
            },
            incidentClosed: {
              title: "Incident tancat",
              description: "Cas {{incident}} resolt per {{owner}}"
            },
            documentUpdated: {
              title: "Documentació actualitzada",
              description: "S'ha publicat {{document}} per a {{system}}"
            },
            taskCreated: {
              title: "Nova tasca de compliment",
              description: "{{task}} assignada a l'equip de {{system}}"
            }
          }
        },
        actions: {
          title: "Accions pendents",
          subtitle: "Seguiment de tasques clau",
          empty: "Sense accions pendents",
          columns: {
            task: "Acció",
            system: "Sistema",
            due: "Data",
            owner: "Responsable",
            status: "Estat",
            priority: "Prioritat"
          },
          status: {
            todo: "Pendent",
            in_review: "En revisió",
            approved: "Aprovat"
          },
          priority: {
            high: "Alta",
            medium: "Mitjana",
            low: "Baixa"
          },
          items: {
            reviewRisk: "Revisar el pla de mitigació de {{system}}",
            updateDossier: "Actualitzar l'expedient tècnic de {{system}}",
            scheduleAudit: "Programar l'auditoria interna de {{system}}",
            validateIncident: "Validar el seguiment de l'incident a {{system}}"
          }
        }
      },
      projects: {
        pageTitle: "Projectes",
        pageSubtitle: "Gestiona els sistemes d'IA i la seva documentació associada.",
        actions: {
          newProject: "Nou projecte"
        },
        filters: {
          role: {
            label: "Rol",
            all: "Tots"
          },
          risk: {
            label: "Risc",
            all: "Tots"
          },
          doc: {
            label: "Documentació",
            all: "Totes"
          },
          search: {
            label: "Cerca projectes…",
            placeholder: "Nom del projecte"
          }
        },
        columns: {
          name: "Projecte",
          role: "Rol",
          state: "Estat",
          risk: "Risc",
          docStatus: "DoC",
          lastAssessment: "Darrera avaluació",
          actions: "Accions"
        },
        state: {
          labels: {
            initial: "Inici",
            in_progress: "En curs",
            maintenance: "Manteniment"
          }
        },
        wizard: {
          title: "Assistent de Nou Projecte",
          subtitle: "Segueix els passos per crear un projecte i registrar-ne les dades bàsiques.",
          addContact: "Afegeix Contacte",
          steps: {
            details: "Detalls",
            team: "Equip",
            riskAssessment: "Avaluació de Risc",
            summary: "Resum"
          },
          help: {
            ariaLabel: "Mostra l'ajuda del pas"
          },
          fields: {
            name: "Nom del projecte",
            role: "Rol a la cadena de valor",
            purpose: "Finalitat del sistema",
            owner: "Responsable del projecte",
            businessUnit: "Unitat de negoci (opcional)",
            deployments: "Desplegaments previstos",
            team: "Membres de l'equip",
            risk: "Risc identificat",
            notes: "Notes addicionals"
          },
          contact: {
            name: "Nom",
            role: "Rol",
            email: "Email",
            phone: "Telèfon",
            notification: "Mètode d'avís"
          },
          descriptions: {
            team: "Afegeix els contactes clau per a aquest projecte."
          },
          placeholders: {
            team: "p.ex. ada.lovelace@example.com, grace.hopper@example.com",
            notes: "Anotacions sobre l'abast, el context o els propers passos...",
            businessUnit: "Unitat o departament principal",
            purpose: "Descriu la finalitat principal del sistema",
            owner: "Nom de la persona responsable"
          },
          deployments: {
            helper: "Selecciona els entorns previstos per al desplegament.",
            options: {
              sandbox: "Sandbox / entorn controlat",
              pilot: "Pilot amb usuaris reals",
              production: "Producció",
              internal_only: "Ús intern només"
            }
          },
          risk: {
            description: "Selecciona la classificació de risc identificada després de l'avaluació inicial.",
            option: "Risc {{risk}}"
          },
          team: {
            empty: "Encara no hi ha contactes assignats.",
            form: {
              title: "Afegeix membre de l'equip",
              description: "Omple les dades i assigna responsabilitats RACI.",
              raciTitle: "Responsabilitats RACI",
              raciHelper: "Selecciona els rols que pertoquen a aquesta persona.",
              owner: "Owner del projecte",
              reviewer: "Revisor/a",
              submit: "Afegeix a l'equip"
            },
            raci: {
              responsible: "Responsable (R)",
              accountable: "Aprovador (A)",
              consulted: "Consultat (C)",
              informed: "Informada (I)",
              none: "Sense assignar"
            },
            table: {
              responsibilities: "Responsabilitats",
              owner: "Owner",
              reviewer: "Revisor/a"
            },
            owner: {
              yes: "Sí",
              no: "No"
            },
            reviewer: {
              yes: "Sí",
              no: "No"
            },
            invites: {
              title: "Invitacions pendents",
              description: "Envia invitacions per correu perquè completin el seu perfil.",
              placeholder: "persona@empresa.com",
              add: "Envia invitació",
              empty: "Sense invitacions pendents",
              status: "Estat",
              pending: "Pendent",
              remove: "Cancel·la invitació",
              summaryLabel: "Invitacions",
              summary: "{{count}} invitacions pendents"
            }
          },
          validations: {
            deployments: "Selecciona almenys un desplegament previst."
          },
          summary: {
            title: "Resum del Projecte",
            contacts: "Contactes",
            teamCount: "{{count}} contactes",
            unset: "No definida",
            unclassifiedRisk: "Sense classificar",
            justification: "Justificació",
            noNotes: "Sense notes"
          },
          finish: "Crea Projecte"
        }
      },
      incidents: {
        pageTitle: "Incidents",
        pageSubtitle: "Seguiment d'incidents reportats i del seu estat de revisió.",
        columns: {
          id: "ID",
          system: "Sistema",
          severity: "Severitat",
          status: "Estat",
          date: "Data",
          title: "Títol"
        },
        empty: "No hi ha incidents registrats per a aquest context."
      },
      roles: {
        provider: "Proveïdor",
        importer: "Importador",
        distributor: "Distribuïdor",
        user: "Usuari"
      },
      riskLevels: {
        inaceptable: "Inacceptable",
        alto: "Alt",
        limitado: "Limitat",
        minimo: "Mínim"
      },
      docStatus: {
        vigente: "Vigent",
        obsoleta: "Obsoleta",
        borrador: "Esborrany",
        na: "N/D"
      },
      incident: {
        severity: {
          alta: "Alta",
          media: "Mitjana",
          baja: "Baixa"
        },
        status: {
          abierto: "Obert",
          en_revision: "En revisió",
          cerrado: "Tancat"
        }
      },
      systemDetail: {
        loading: "Carregant…",
        notFound: "No s'ha trobat",
        identifier: "Identificador: {{id}}",
        stats: {
          role: "Rol",
          risk: "Risc",
          docStatus: "Estat documental"
        },
        chips: {
          role: "Rol: {{role}}",
          risk: "Risc: {{risk}}",
          doc: "DoC: {{doc}}"
        },
        actions: {
          reportIncident: "Reporta incident"
        },
        alerts: {
          incidentReported: "Incident reportat ({{id}})"
        },
        tabs: {
          overview: "Resum",
          risk: "Risc",
          documentation: "Documentació",
          workflows: "Workflows",
          evidences: "Evidències",
          history: "Historial"
        },
        content: {
          overview: "Metadades i darrers canvis…",
          riskTitle: "Avaluacions de risc",
          riskEmpty: "Encara no hi ha avaluacions.",
          documentation: "Seccions de l'expedient tècnic…",
          workflows: "Kanban de compliment…",
          evidences: "Evidències adjuntes…",
          history: "Cronologia de canvis…"
        },
        assessments: {
          title: "Avaluacions de risc",
          empty: "No hi ha avaluacions de risc registrades.",
          columns: {
            date: "Data",
            classification: "Classificació",
            justification: "Justificació"
          }
        },
        dialog: {
          title: "Reporta incident",
          fields: {
            title: "Títol",
            severity: "Severitat",
            description: "Descripció"
          },
          actions: {
            cancel: "Cancel·la",
            submit: "Envia"
          }
        }
      },
      technicalDossier: {
        title: "Expedient tècnic (AI Act - Annex IV)",
        actions: {
          sync: "Sincronitza amb el backend",
          syncSuccess: "Expedient sincronitzat amb el backend (mock)"
        },
        sections: {
          general_info: {
            title: "Informació general",
            fields: {
              system_name: "Nom del sistema",
              provider: "Proveïdor",
              contact: "Contacte responsable"
            }
          },
          description: {
            title: "Descripció del sistema",
            fields: {
              purpose: "Finalitat prevista",
              architecture: "Arquitectura tècnica",
              lifecycle: "Cicle de vida del desenvolupament"
            }
          }
        }
      },
      riskWizard: {
        steps: {
          context: "Context",
          rights: "Drets",
          biometric: "Biomètric",
          damage: "Dany",
          annexIII: "Annex III",
          transparency: "Transparència",
          result: "Resultat"
        },
        form: {
          yes: "Sí",
          no: "No",
          selectPlaceholder: "Selecciona una opció..."
        },
        result: {
          title: "Resultat de l'Avaluació de Risc",
          classificationLabel: "Classificació Suggerida",
          justification: "Justificació",
          implications: "Implicacions",
          nextSteps: "Propers Passos"
        },
        results: {
          alto: {
            title: "Risc Alt",
            implications: "El sistema d'IA es classifica com d'alt risc segons l'AI Act. Això implica que està subjecte a requisits legals estrictes abans i després de la seva posada al mercat, incloent avaluacions de conformitat, registre a bases de dades de la UE i un sistema robust de gestió de riscos.",
            next_steps: [
              "Realitzar una avaluació de conformitat completa segons l'Annex VI.",
              "Registrar el sistema a la base de dades de la UE abans de la seva comercialització.",
              "Establir un sistema de gestió de riscos continu.",
              "Garantir una alta qualitat i governança de les dades d'entrenament i prova.",
              "Assegurar un nivell apropiat de supervisió humana i ciberseguretat."
            ]
          },
          limitado: {
            title: "Risc Limitat",
            implications: "El sistema presenta un risc limitat, principalment relacionat amb la transparència. No s'apliquen els requisits dels sistemes d'alt risc, però s'han de complir obligacions específiques per assegurar que els usuaris finals estiguin informats.",
            next_steps: [
              "Assegurar que els usuaris siguin informats que estan interactuant amb un sistema d'IA (p. ex. en chatbots).",
              "Etiquetar de forma clara i visible el contingut generat o manipulat per la IA (p. ex. 'deep fakes').",
              "Avaluar periòdicament si els casos d'ús del sistema podrien evolucionar cap a un risc més gran."
            ]
          },
          minimo: {
            title: "Risc Mínim",
            implications: "El sistema es considera de risc mínim o nul. L'AI Act no imposa obligacions legals per a aquesta categoria, permetent el seu lliure ús.",
            next_steps: [
              "Es recomana l'adhesió voluntària a codis de conducta per fomentar la confiança.",
              "Monitorar l'ús del sistema per detectar possibles nous riscos no contemplats en l'avaluació inicial.",
              "No es requereixen accions de compliment obligatòries."
            ]
          }
        }
      },
      riskWizardDynamic: {
        steps: {
          context: "Context",
          biometric: "Identificació biomètrica",
          damage: "Possible dany",
          annexIII: "Annex III",
          transparency: "Transparència",
          result: "Resultat"
        },
        questions: {
          fundamental_rights: {
            text: "Sobre quins drets fonamentals podria incidir el sistema?",
            options: {
              dignidad: "Dignitat",
              libertades: "Llibertats",
              igualdad: "Igualtat",
              solidaridad: "Solidaritat",
              derechos_de_los_ciudadanos: "Drets dels ciutadans",
              justicia: "Justícia",
              ninguno_de_los_anteriores: "Cap dels anteriors"
            }
          },
          sector: {
            text: "Sector principal d'ús",
            options: {
              salud: "Salut",
              educacion: "Educació",
              seguridad: "Seguretat",
              finanzas: "Finances",
              otros: "Altres"
            }
          },
          biometric_use: {
            text: "Quin tipus de sistema d'identificació biomètrica utilitza?",
            options: {
              identificación_biométrica_remota_en_tiempo_real: "Identificació biomètrica remota 'en temps real'",
              identificación_biométrica_remota_a_posteriori: "Identificació biomètrica remota 'a posteriori'",
              categorización_biométrica_basada_en_atributos_sensibles: "Categorització biomètrica basada en atributs sensibles",
              reconocimiento_de_emociones: "Reconeixement d'emocions",
              extracción_no_selectiva_de_imágenes_faciales: "Extracció no selectiva d'imatges facials",
              no_se_utiliza_ninguno_de_estos_sistemas: "No s'utilitza cap d'aquests sistemes"
            }
          },
          harm_level: {
            text: "Quins tipus de dany podria causar el sistema?",
            options: {
              daño_grave_a_la_salud_o_integridad_física: "Dany greu a la salut o integritat física",
              daño_psicológico_significativo: "Dany psicològic significatiu",
              perjuicio_económico_sustancial: "Perjudici econòmic substancial",
              daño_grave_al_medio_ambiente: "Dany greu al medi ambient",
              interrupción_de_infraestructuras_críticas: "Interrupció d'infraestructures crítiques",
              ninguno: "Cap"
            }
          },
          annex_sector: {
            text: "S'inclou en algun sector de l'Annex III?",
            options: {
              empleo: "Ocupació",
              credito: "Crèdit",
              educacion: "Educació",
              sanidad: "Sanitat",
              policia_judicial: "Policia/Judicial",
              no_aplica_a_ninguno_de_estos_sectores: "No aplica a cap d'aquests sectors"
            }
          },
          human_disclosure: {
            text: "El sistema informa clarament quan hi ha interacció amb IA?"
          },
          human_disclosure_method: {
            text: "Si us plau, descriu el mètode utilitzat per informar:"
          }
        },
        rules: {
          biometric_use: "Ús d'un sistema d'identificació biomètrica considerat d'alt risc.",
          annex_sector: "Àmbit regulat per l'Annex III",
          harm_level_high: "El sistema pot causar un tipus de dany considerat d'alt risc.",
          fundamental_rights: "El sistema pot afectar drets fonamentals.",
          default: "No s'han identificat factors d'alt risc"
        }
      },
      placeholders: {
        auditEvidences: "Vista d'auditoria i evidències (placeholder)",
        calendarWorkflows: "Vista de calendari i workflows (placeholder)",
        orgRoles: "Vista d'organització i rols (placeholder)",
        settings: "Vista de configuració (placeholder)"
      }
    }
  },
  fr: {
    translation: {
      app: {
        title: "Gestionnaire de conformité à l'IA Act",
        shortTitle: "AI Act CM",
        searchPlaceholder: "Rechercher…",
        searchAria: "Rechercher dans l'application",
        greeting: "Bonjour",
        languageLabel: "Langue",
        languageLabelShort: "LANG",
        languageSelectAria: "Sélectionner la langue",
        sidebarSubtitle: "Outil de suivi",
        appBarPrefix: "│ AppBar :",
        appBarLogo: "Logo",
        menuToggle: "Ouvrir le menu",
        projectSelector: {
          title: "Projet actif",
          placeholder: "Sélectionner un projet",
          all: "Tous les projets",
          empty: "Aucun projet actif",
          wizardDisabled: "Indisponible pendant la création d'un nouveau projet."
        },
        layout: {
          defaultProjectTitle: "Tableau de bord",
          selectProjectHint: "Sélectionnez un projet"
        },
        guestUser: "Invité",
        noSession: "Pas de session",
        logout: "Se déconnecter",
        userMenu: {
          pendingActions: "Mes actions en attente",
          openMenu: "Ouvrir le menu utilisateur"
        },
        footer: {
          online: "Statut de connexion : En ligne",
          offline: "Statut de connexion : Hors ligne",
          version: "Version : v{{version}}"
        }
      },
      nav: {
        dashboard: "Tableau de bord",
        projects: "Projets",
        risk: "Risque",
        incidents: "Incidents",
        calendar: "Calendrier",
        org: "Organisation & rôles",
        audit: "Audit",
        settings: "Paramètres",
        projectGroup: "Projet: {{name}}",
        project: {
          evidences: "Preuves",
          teams: "Équipes",
          audits: "Audits",
          deliverables: "Livrables",
          calendar: "Calendrier",
          org: "Org & Rôles",
          audit: "Audit"
        }
      },
      auth: {
        fields: {
          company: "Entreprise",
          email: "E-mail",
          password: "Mot de passe"
        },
        login: {
          title: "Connexion",
          subtitle: "Accédez à la plateforme de conformité avec vos identifiants d'entreprise.",
          submit: "Se connecter",
          or: "ou",
          ssoButton: "Continuer avec le SSO d'entreprise",
          ssoHint: "Le SSO d'entreprise nécessite un abonnement actif de votre organisation.",
          ssoLabel: "SSO d'entreprise",
          noAccount: "Pas encore de compte ?",
          goToSignUp: "Créer un compte"
        },
        signup: {
          title: "Créer votre compte",
          subtitle: "Inscrivez votre équipe pour gérer la conformité à l'AI Act.",
          fullName: "Nom complet",
          company: "Entreprise",
          email: "E-mail professionnel",
          password: "Mot de passe",
          passwordHelper: "Au moins 6 caractères, une majuscule et un caractère spécial.",
          contactLabel: "Méthode de contact préférée",
          contactEmail: "E-mail de contact",
          contactPhoneSms: "Numéro de mobile (SMS)",
          contactPhoneWhatsapp: "Numéro WhatsApp",
          contactSlackUser: "Utilisateur ou canal Slack",
          slackWorkspace: "Espace de travail Slack",
          slackChannel: "Canal ou utilisateur",
          avatarLabel: "Avatar (optionnel)",
          uploadAvatar: "Télécharger un avatar",
          changeAvatar: "Modifier l'avatar",
          submit: "Créer le compte",
          hasAccount: "Vous avez déjà un compte ?",
          goToLogin: "Retour au login",
          language: "Langue préférée",
          verificationTitle: "Vérifiez votre compte",
          verificationSubtitle: "Nous avons envoyé un code de vérification à {{email}}. Saisissez-le pour finaliser l'inscription.",
          verificationCodeLabel: "Code de vérification",
          verifyButton: "Confirmer le code",
          resendButton: "Envoyer un nouveau code",
          resendHelp: "Vous ne l'avez pas reçu ? Vérifiez vos spams ou demandez un nouveau code.",
          verificationMissing: "Impossible de trouver l'inscription. Veuillez recommencer.",
          verificationCodeRequired: "Saisissez les 8 caractères du code envoyé.",
          verificationUnavailableTitle: "Vérification indisponible",
          verificationUnavailableSubtitle: "Nous n'avons trouvé aucune inscription en attente. Lancez un nouveau processus pour continuer.",
          returnToRegistration: "Retour à l'inscription",
          modifyDataPrompt: "Besoin de modifier vos informations ?",
          editRegistration: "Modifier l'inscription"
        },
        contactMethods: {
          email: "E-mail",
          sms: "SMS",
          whatsapp: "WhatsApp",
          slack: "Slack"
        },
        feedback: {
          loginSuccess: "Bon retour, {{name}}.",
          loginError: "Impossible de vous connecter avec ces identifiants.",
          ssoSuccess: "Connecté avec {{provider}} en tant que {{name}}.",
          ssoError: "La connexion SSO a échoué.",
          signUpSuccess: "Inscription terminée pour {{name}}.",
          signUpError: "Impossible de finaliser l'inscription.",
          signUpVerificationSent: "Nous avons envoyé un code de vérification à {{email}}.",
          signUpVerificationError: "Le code de vérification est invalide ou a expiré.",
          signUpVerificationResent: "Un nouveau code a été envoyé à {{email}}.",
          signUpVerified: "Votre compte a été vérifié avec succès.",
          avatarError: "Impossible de traiter l'image sélectionnée."
        }
      },
      deliverables: {
        title: "Livrables du Projet",
        subtitle: "Gérez la documentation obligatoire du projet sélectionné.",
        columns: {
          name: "Livrable",
          status: "Statut",
          version: "Version",
          actions: "Actions"
        },
        actions: {
          upload: "Télécharger",
          assign: "Assigner"
        },
        status: {
          open: "Ouvert",
          inProgress: "En cours",
          inReview: "En révision",
          done: "Terminé"
        },
        assignModal: {
          title: "Assigner le Livrable",
          assignee: "Assigner à",
          dueDate: "Date d'échéance",
          placeholder: "Sélectionnez un contact"
        }
      },
      calendarWorkflows: {
        title: "Calendrier et workflows",
        subtitle: "Consultez les tâches et jalons planifiés pour le projet {{project}}.",
        empty: "Aucune tâche enregistrée pour ce projet.",
        task: {
          assignee: "Attribué à {{assignee}}",
          unassigned: "Non attribué",
          due: "Date cible : {{date}}"
        }
      },
      settings: {
        pageTitle: "Paramètres",
        pageSubtitle: "Préférences du compte et notifications personnelles.",
        title: "Paramètres de l'application",
        account: {
          title: "Compte",
          noSession: "Aucune session active",
          noCompany: "Organisation non définie"
        },
        preferences: {
          title: "Préférences",
          language: "Langue de l'interface",
          theme: "Thème",
          themeOptions: {
            light: "Clair",
            dark: "Sombre"
          }
        },
        notifications: {
          title: "Notifications",
          channels: {
            email: "E-mail",
            slack: "Slack",
            sms: "SMS"
          },
          items: {
            incidents: {
              label: "Alertes d'incidents",
              description: "Recevez un e-mail lorsqu'un incident critique est enregistré."
            },
            deliverables: {
              label: "Rappels de livrables",
              description: "Rappels hebdomadaires pour les livrables proches de l'échéance."
            },
            audits: {
              label: "Exécution d'audits",
              description: "Notifications sur les audits planifiés et leurs résultats."
            }
          }
        },
        integrations: {
          title: "Intégrations",
          apiKey: "Clé API",
          regenerate: "Régénérer"
        }
      },
      languages: {
        es: { short: "ES", full: "Espagnol" },
        en: { short: "EN", full: "Anglais" },
        ca: { short: "CA", full: "Catalan" },
        fr: { short: "FR", full: "Français" }
      },
      common: {
        cancel: "Annuler",
        send: "Envoyer",
        back: "Retour",
        next: "Suivant",
        finish: "Terminer",
        view: "Voir",
        loading: "Chargement…",
        notFound: "Introuvable",
        notAvailable: "N/D",
        remove: "Supprimer"
      },
      dashboard: {
        pageTitle: "Tableau de bord",
        pageSubtitle: "Résumé des indicateurs de conformité et de l'activité récente.",
        metrics: {
          registeredProjects: "Projets enregistrés",
          registeredProjectsSubtitle: "3+ ce mois-ci",
          highRiskProjects: "Projets à haut risque",
          highRiskProjectsSubtitle: "12 % du total",
          pendingEvidences: "Preuves en attente",
          pendingEvidencesSubtitle: "10 résolues ce mois-ci",
          pendingTasks: "Tâches en attente",
          pendingTasksSubtitle: "5 pour cette semaine",
          tasksPending_one: "{{count}} tâche en attente",
          tasksPending_other: "{{count}} tâches en attente"
        },
        riskOverview: {
          title: "Projets d'IA par risque",
          subtitle: "Répartition des systèmes selon la classification de risque du Règlement UE",
          levels: {
            high: "Risque élevé",
            limited: "Risque limité",
            minimal: "Risque minimal"
          },
          systemsLabel_one: "{{count}} système",
          systemsLabel_other: "{{count}} systèmes",
          progressLabel: "{{level}} : {{percentage}}%"
        },
        timeline: {
          title: "Activité récente",
          subtitle: "Dernières mises à jour enregistrées",
          empty: "Aucun événement récent",
          types: {
            riskAssessment: "Risque",
            incidentClosed: "Incident",
            documentUpdated: "Documentation",
            taskCreated: "Workflow"
          },
          items: {
            riskAssessment: {
              title: "Évaluation des risques mise à jour",
              description: "Le système {{system}} a été classé {{risk}}"
            },
            incidentClosed: {
              title: "Incident clôturé",
              description: "Cas {{incident}} résolu par {{owner}}"
            },
            documentUpdated: {
              title: "Documentation mise à jour",
              description: "{{document}} publié pour {{system}}"
            },
            taskCreated: {
              title: "Nouvelle tâche de conformité",
              description: "{{task}} assignée à l'équipe {{system}}"
            }
          }
        },
        actions: {
          title: "Actions en attente",
          subtitle: "Suivi des tâches clés",
          empty: "Aucune action en attente",
          columns: {
            task: "Action",
            system: "Système",
            due: "Échéance",
            owner: "Responsable",
            status: "Statut",
            priority: "Priorité"
          },
          status: {
            todo: "À faire",
            in_review: "En revue",
            approved: "Approuvé"
          },
          priority: {
            high: "Élevée",
            medium: "Moyenne",
            low: "Faible"
          },
          items: {
            reviewRisk: "Revoir le plan de mitigation pour {{system}}",
            updateDossier: "Mettre à jour le dossier technique de {{system}}",
            scheduleAudit: "Planifier l'audit interne de {{system}}",
            validateIncident: "Valider le suivi de l'incident dans {{system}}"
          }
        }
      },
      projects: {
        pageTitle: "Projets",
        pageSubtitle: "Gérez les systèmes d'IA et leur documentation associée.",
        actions: {
          newProject: "Nouveau projet"
        },
        filters: {
          role: {
            label: "Rôle",
            all: "Tous"
          },
          risk: {
            label: "Risque",
            all: "Tous"
          },
          doc: {
            label: "Documentation",
            all: "Toutes"
          },
          search: {
            label: "Rechercher des projets…",
            placeholder: "Nom du projet"
          }
        },
        columns: {
          name: "Projet",
          role: "Rôle",
          state: "Statut",
          risk: "Risque",
          docStatus: "DoC",
          lastAssessment: "Dernière évaluation",
          actions: "Actions"
        },
        state: {
          labels: {
            initial: "Lancement",
            in_progress: "En cours",
            maintenance: "Maintenance"
          }
        },
        wizard: {
          title: "Assistant de Nouveau Projet",
          subtitle: "Suivez les étapes pour créer un projet et enregistrer ses données clés.",
          addContact: "Ajouter un contact",
          steps: {
            details: "Détails",
            team: "Équipe",
            riskAssessment: "Évaluation des Risques",
            summary: "Résumé"
          },
          help: {
            ariaLabel: "Afficher l'aide de l'étape"
          },
          fields: {
            name: "Nom du projet",
            role: "Rôle dans la chaîne de valeur",
            purpose: "Finalité du système",
            owner: "Responsable du projet",
            businessUnit: "Unité commerciale (optionnel)",
            deployments: "Déploiements prévus",
            team: "Membres de l'équipe",
            risk: "Risque identifié",
            notes: "Notes supplémentaires"
          },
          contact: {
            name: "Nom",
            role: "Rôle",
            email: "Email",
            phone: "Téléphone",
            notification: "Méthode de notification"
          },
          descriptions: {
            team: "Ajoutez les contacts clés pour ce projet."
          },
          placeholders: {
            team: "p.ex. ada.lovelace@example.com, grace.hopper@example.com",
            notes: "Notes sur le périmètre, le contexte ou les prochaines étapes...",
            businessUnit: "Unité ou département principal",
            purpose: "Décrivez la finalité principale du système",
            owner: "Nom du responsable"
          },
          deployments: {
            helper: "Sélectionnez les environnements prévus pour le déploiement.",
            options: {
              sandbox: "Sandbox / environnement contrôlé",
              pilot: "Pilote avec des utilisateurs réels",
              production: "Production",
              internal_only: "Usage interne uniquement"
            }
          },
          risk: {
            description: "Sélectionnez la classification de risque identifiée après l'évaluation initiale.",
            option: "Risque {{risk}}"
          },
          team: {
            empty: "Aucun contact ajouté pour le moment.",
            form: {
              title: "Ajouter un membre de l'équipe",
              description: "Renseignez les informations et assignez les responsabilités RACI.",
              raciTitle: "Responsabilités RACI",
              raciHelper: "Sélectionnez les rôles applicables à cette personne.",
              owner: "Propriétaire du projet",
              reviewer: "Relecteur",
              submit: "Ajouter à l'équipe"
            },
            raci: {
              responsible: "Responsable (R)",
              accountable: "Approbateur (A)",
              consulted: "Consulté (C)",
              informed: "Informé (I)",
              none: "Non assigné"
            },
            table: {
              responsibilities: "Responsabilités",
              owner: "Owner",
              reviewer: "Relecteur"
            },
            owner: {
              yes: "Oui",
              no: "Non"
            },
            reviewer: {
              yes: "Oui",
              no: "Non"
            },
            invites: {
              title: "Invitations en attente",
              description: "Envoyez des invitations par email pour qu'ils complètent leur profil.",
              placeholder: "personne@entreprise.com",
              add: "Envoyer invitation",
              empty: "Aucune invitation en attente",
              status: "Statut",
              pending: "En attente",
              remove: "Annuler l'invitation",
              summaryLabel: "Invitations",
              summary: "{{count}} invitations en attente"
            }
          },
          validations: {
            deployments: "Sélectionnez au moins un déploiement prévu."
          },
          summary: {
            title: "Résumé du Projet",
            contacts: "Contacts",
            teamCount: "{{count}} contacts",
            unset: "Non défini",
            unclassifiedRisk: "Non classé",
            justification: "Justification",
            noNotes: "Aucune note"
          },
          finish: "Créer le Projet"
        }
      },
      incidents: {
        pageTitle: "Incidents",
        pageSubtitle: "Suivez les incidents déclarés et leur état de revue.",
        columns: {
          id: "ID",
          system: "Système",
          severity: "Gravité",
          status: "Statut",
          date: "Date",
          title: "Titre"
        },
        empty: "Aucun incident enregistré pour ce contexte."
      },
      roles: {
        provider: "Fournisseur",
        importer: "Importateur",
        distributor: "Distributeur",
        user: "Utilisateur"
      },
      riskLevels: {
        inaceptable: "Inacceptable",
        alto: "Élevé",
        limitado: "Limité",
        minimo: "Minimal"
      },
      docStatus: {
        vigente: "En vigueur",
        obsoleta: "Obsolète",
        borrador: "Brouillon",
        na: "N/D"
      },
      incident: {
        severity: {
          alta: "Élevée",
          media: "Moyenne",
          baja: "Faible"
        },
        status: {
          abierto: "Ouvert",
          en_revision: "En révision",
          cerrado: "Fermé"
        }
      },
      systemDetail: {
        loading: "Chargement…",
        notFound: "Introuvable",
        identifier: "Identifiant : {{id}}",
        stats: {
          role: "Rôle",
          risk: "Risque",
          docStatus: "Statut documentaire"
        },
        chips: {
          role: "Rôle : {{role}}",
          risk: "Risque : {{risk}}",
          doc: "DoC : {{doc}}"
        },
        actions: {
          reportIncident: "Déclarer un incident"
        },
        alerts: {
          incidentReported: "Incident déclaré ({{id}})"
        },
        tabs: {
          overview: "Vue d'ensemble",
          risk: "Risque",
          documentation: "Documentation",
          workflows: "Workflows",
          evidences: "Preuves",
          history: "Historique"
        },
        content: {
          overview: "Métadonnées et dernières mises à jour…",
          riskTitle: "Évaluations de risque",
          riskEmpty: "Aucune évaluation pour le moment.",
          documentation: "Sections du dossier technique…",
          workflows: "Kanban de conformité…",
          evidences: "Preuves jointes…",
          history: "Chronologie des changements…"
        },
        assessments: {
          title: "Évaluations de risque",
          empty: "Aucune évaluation de risque enregistrée.",
          columns: {
            date: "Date",
            classification: "Classification",
            justification: "Justification"
          }
        },
        dialog: {
          title: "Déclarer un incident",
          fields: {
            title: "Titre",
            severity: "Gravité",
            description: "Description"
          },
          actions: {
            cancel: "Annuler",
            submit: "Envoyer"
          }
        }
      },
      technicalDossier: {
        title: "Dossier technique (AI Act - Annexe IV)",
        actions: {
          sync: "Synchroniser avec le backend",
          syncSuccess: "Dossier technique synchronisé avec le backend (mock)"
        },
        sections: {
          general_info: {
            title: "Informations générales",
            fields: {
              system_name: "Nom du système",
              provider: "Fournisseur",
              contact: "Contact responsable"
            }
          },
          description: {
            title: "Description du système",
            fields: {
              purpose: "Finalité prévue",
              architecture: "Architecture technique",
              lifecycle: "Cycle de vie du développement"
            }
          }
        }
      },
      riskWizard: {
        steps: {
          context: "Contexte",
          rights: "Droits",
          biometric: "Biométrique",
          damage: "Dommage",
          annexIII: "Annexe III",
          transparency: "Transparence",
          result: "Résultat"
        },
        form: {
          yes: "Oui",
          no: "Non",
          selectPlaceholder: "Sélectionnez une option..."
        },
        result: {
          title: "Résultat de l'Évaluation des Risques",
          classificationLabel: "Classification Suggérée",
          justification: "Justification",
          implications: "Implications",
          nextSteps: "Prochaines Étapes"
        },
        results: {
          alto: {
            title: "Risque Élevé",
            implications: "Le système d'IA est classé à haut risque en vertu de l'AI Act. Cela signifie qu'il est soumis à des exigences légales strictes avant et après sa mise sur le marché, y compris des évaluations de conformité, un enregistrement dans la base de données de l'UE et un système de gestion des risques robuste.",
            next_steps: [
              "Mener une évaluation de conformité complète conformément à l'annexe VI.",
              "Enregistrer le système dans la base de données de l'UE avant son entrée sur le marché.",
              "Établir un système de gestion des risques continu.",
              "Garantir une gouvernance et une qualité élevées des données d'entraînement et de test.",
              "Assurer des niveaux appropriés de surveillance humaine et de cybersécurité."
            ]
          },
          limitado: {
            title: "Risque Limité",
            implications: "Le système présente un risque limité, principalement lié à la transparence. Les exigences pour les systèmes à haut risque ne s'appliquent pas, mais des obligations spécifiques doivent être respectées pour garantir que les utilisateurs finaux sont informés.",
            next_steps: [
              "S'assurer que les utilisateurs sont informés qu'ils interagissent avec un système d'IA (par exemple, dans les chatbots).",
              "Étiqueter de manière claire et visible le contenu généré ou manipulé par l'IA (par exemple, les 'deep fakes').",
              "Évaluer périodiquement si les cas d'utilisation du système pourraient évoluer vers une catégorie de risque plus élevée."
            ]
          },
          minimo: {
            title: "Risque Minimal",
            implications: "Le système est considéré comme présentant un risque minimal ou nul. L'AI Act n'impose pas d'obligations légales pour cette catégorie, autorisant son libre usage.",
            next_steps: [
              "L'adhésion volontaire à des codes de conduite est recommandée pour favoriser la confiance.",
              "Surveiller l'utilisation du système pour détecter d'éventuels nouveaux risques non couverts par l'évaluation initiale.",
              "Aucune action de conformité obligatoire n'est requise."
            ]
          }
        }
      },
      riskWizardDynamic: {
        steps: {
          context: "Contexte",
          biometric: "Identification biométrique",
          damage: "Dommage potentiel",
          annexIII: "Annexe III",
          transparency: "Transparence",
          result: "Résultat"
        },
        questions: {
          fundamental_rights: {
            text: "Quels droits fondamentaux le système pourrait-il affecter ?",
            options: {
              dignidad: "Dignité",
              libertades: "Libertés",
              igualdad: "Égalité",
              solidaridad: "Solidarité",
              derechos_de_los_ciudadanos: "Droits des citoyens",
              justicia: "Justice",
              ninguno_de_los_anteriores: "Aucun des précédents"
            }
          },
          sector: {
            text: "Secteur principal d'utilisation",
            options: {
              salud: "Santé",
              educacion: "Éducation",
              seguridad: "Sécurité",
              finanzas: "Finance",
              autres: "Autres"
            }
          },
          biometric_use: {
            text: "Quel type de système d'identification biométrique utilise-t-il ?",
            options: {
              identificación_biométrica_remota_en_tiempo_real: "Identification biométrique à distance 'en temps réel'",
              identificación_biométrica_remota_a_posteriori: "Identification biométrique à distance 'a posteriori'",
              categorización_biométrica_basada_en_atributos_sensibles: "Catégorisation biométrique basée sur des attributs sensibles",
              reconocimiento_de_emociones: "Reconnaissance des émotions",
              extracción_no_selectiva_de_imágenes_faciales: "Extraction non ciblée d'images faciales",
              no_se_utiliza_ninguno_de_estos_sistemas: "Aucun de ces systèmes n'est utilisé"
            }
          },
          harm_level: {
            text: "Quels types de dommages le système pourrait-il causer ?",
            options: {
              daño_grave_a_la_salud_o_integridad_física: "Dommages graves à la santé ou à l'intégrité physique",
              daño_psicológico_significativo: "Dommages psychologiques importants",
              perjuicio_económico_sustancial: "Pertes économiques substantielles",
              daño_grave_al_medio_ambiente: "Dommages graves à l'environnement",
              interrupción_de_infraestructuras_críticas: "Interruption des infrastructures critiques",
              ninguno: "Aucun"
            }
          },
          annex_sector: {
            text: "Relève-t-il d'un des secteurs de l'annexe III ?",
            options: {
              empleo: "Emploi",
              credito: "Crédit",
              educacion: "Éducation",
              sanidad: "Santé",
              policia_judicial: "Police/Judiciaire",
              no_aplica_a_ninguno_de_estos_sectores: "Ne s'applique à aucun de ces secteurs"
            }
          },
          human_disclosure: {
            text: "Le système informe-t-il clairement lors d'interactions IA ?"
          },
          human_disclosure_method: {
            text: "Veuillez décrire la méthode utilisée pour informer :"
          }
        },
        rules: {
          biometric_use: "Utilisation d'un système d'identification biométrique considéré à haut risque.",
          annex_sector: "Domaine réglementé par l'annexe III",
          harm_level_high: "Le système peut causer un type de dommage considéré à haut risque.",
          fundamental_rights: "Le système peut affecter des droits fondamentaux.",
          default: "Aucun facteur de haut risque détecté"
        }
      },
      placeholders: {
        auditEvidences: "Vue Audit & preuves (placeholder)",
        calendarWorkflows: "Vue Calendrier & workflows (placeholder)",
        orgRoles: "Vue Organisation & rôles (placeholder)",
        settings: "Vue Paramètres (placeholder)"
      }
    }
  }
} as const

const languageStorageKey = 'app.language'
const storedLanguage = typeof window !== 'undefined' ? localStorage.getItem(languageStorageKey) : null
const initialLanguage = isSupportedLanguage(storedLanguage ?? undefined) ? (storedLanguage as SupportedLanguage) : defaultLanguage

void i18n.init({
  resources,
  lng: initialLanguage,
  fallbackLng: fallbackLanguage,
  interpolation: { escapeValue: false },
  returnNull: false
})

i18n.on('languageChanged', (language) => {
  if (typeof window !== 'undefined' && isSupportedLanguage(language)) {
    localStorage.setItem(languageStorageKey, language)
  }
})

export const t = i18n.t.bind(i18n) as typeof i18n.t

export function changeLanguage(language: SupportedLanguage) {
  return i18n.changeLanguage(language)
}

export function getCurrentLanguage(): SupportedLanguage {
  const language = i18n.resolvedLanguage ?? i18n.language
  return isSupportedLanguage(language) ? language : fallbackLanguage
}

export function onLanguageChanged(listener: (language: SupportedLanguage) => void) {
  const handler = (language: string) => {
    listener(isSupportedLanguage(language) ? language : fallbackLanguage)
  }
  i18n.on('languageChanged', handler)
  return () => {
    i18n.off('languageChanged', handler)
  }
}
export default i18n
