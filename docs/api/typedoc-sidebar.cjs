// @ts-check
/** @type {import("@docusaurus/plugin-content-docs").SidebarsConfig} */
const typedocSidebar = {
  items: [
    {
      type: "category",
      label: "client",
      items: [
        {
          type: "category",
          label: "Functions",
          items: [
            {
              type: "doc",
              id: "../api/client/functions/AuthgearProvider",
              label: "AuthgearProvider"
            },
            {
              type: "doc",
              id: "../api/client/functions/SignInButton",
              label: "SignInButton"
            },
            {
              type: "doc",
              id: "../api/client/functions/SignOutButton",
              label: "SignOutButton"
            },
            {
              type: "doc",
              id: "../api/client/functions/useAuthgear",
              label: "useAuthgear"
            },
            {
              type: "doc",
              id: "../api/client/functions/useUser",
              label: "useUser"
            }
          ]
        },
        {
          type: "category",
          label: "Interfaces",
          items: [
            {
              type: "doc",
              id: "../api/client/interfaces/AuthgearProviderProps",
              label: "AuthgearProviderProps"
            },
            {
              type: "doc",
              id: "../api/client/interfaces/SignInButtonProps",
              label: "SignInButtonProps"
            },
            {
              type: "doc",
              id: "../api/client/interfaces/SignInOptions",
              label: "SignInOptions"
            },
            {
              type: "doc",
              id: "../api/client/interfaces/UseAuthgearReturn",
              label: "UseAuthgearReturn"
            }
          ]
        },
        {
          type: "category",
          label: "Type Aliases",
          items: [
            {
              type: "doc",
              id: "../api/client/type-aliases/SignOutButtonProps",
              label: "SignOutButtonProps"
            }
          ]
        }
      ],
      link: {
        type: "doc",
        id: "../api/client/index"
      }
    },
    {
      type: "category",
      label: "index",
      items: [
        {
          type: "category",
          label: "Functions",
          items: [
            {
              type: "doc",
              id: "../api/index/functions/createAuthgearHandlers",
              label: "createAuthgearHandlers"
            }
          ]
        },
        {
          type: "category",
          label: "Interfaces",
          items: [
            {
              type: "doc",
              id: "../api/index/interfaces/AuthgearConfig",
              label: "AuthgearConfig"
            },
            {
              type: "doc",
              id: "../api/index/interfaces/JWTPayload",
              label: "JWTPayload"
            },
            {
              type: "doc",
              id: "../api/index/interfaces/OIDCConfiguration",
              label: "OIDCConfiguration"
            },
            {
              type: "doc",
              id: "../api/index/interfaces/Session",
              label: "Session"
            },
            {
              type: "doc",
              id: "../api/index/interfaces/SessionData",
              label: "SessionData"
            },
            {
              type: "doc",
              id: "../api/index/interfaces/TokenResponse",
              label: "TokenResponse"
            },
            {
              type: "doc",
              id: "../api/index/interfaces/UserInfo",
              label: "UserInfo"
            }
          ]
        },
        {
          type: "category",
          label: "Enumerations",
          items: [
            {
              type: "doc",
              id: "../api/index/enumerations/Page",
              label: "Page"
            },
            {
              type: "doc",
              id: "../api/index/enumerations/SessionState",
              label: "SessionState"
            }
          ]
        },
        {
          type: "category",
          label: "Variables",
          items: [
            {
              type: "doc",
              id: "../api/index/variables/DEFAULT_SCOPES",
              label: "DEFAULT_SCOPES"
            }
          ]
        }
      ],
      link: {
        type: "doc",
        id: "../api/index/index"
      }
    },
    {
      type: "category",
      label: "proxy",
      items: [
        {
          type: "category",
          label: "Functions",
          items: [
            {
              type: "doc",
              id: "../api/proxy/functions/createAuthgearProxy",
              label: "createAuthgearProxy"
            }
          ]
        },
        {
          type: "category",
          label: "Interfaces",
          items: [
            {
              type: "doc",
              id: "../api/proxy/interfaces/AuthgearProxyOptions",
              label: "AuthgearProxyOptions"
            }
          ]
        }
      ],
      link: {
        type: "doc",
        id: "../api/proxy/index"
      }
    },
    {
      type: "category",
      label: "server",
      items: [
        {
          type: "category",
          label: "Functions",
          items: [
            {
              type: "doc",
              id: "../api/server/functions/auth",
              label: "auth"
            },
            {
              type: "doc",
              id: "../api/server/functions/currentUser",
              label: "currentUser"
            },
            {
              type: "doc",
              id: "../api/server/functions/verifyAccessToken",
              label: "verifyAccessToken"
            }
          ]
        }
      ],
      link: {
        type: "doc",
        id: "../api/server/index"
      }
    }
  ]
};
module.exports = typedocSidebar.items;