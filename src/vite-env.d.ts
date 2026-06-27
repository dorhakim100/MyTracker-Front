/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_GOOGLE_OAUTH_CLIENT_ID?: string
  readonly VITE_PIXABAY_API_KEY?: string
  readonly VITE_USDA_API_KEY?: string
  readonly VITE_BODY_FAT_MOCK_SCENARIO?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.svg?react' {
  import React = require('react')
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
  const src: React.FC<React.SVGProps<SVGSVGElement>>
  export default src
}

declare module '*.svg' {
  import React = require('react')
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
  const src: React.FC<React.SVGProps<SVGSVGElement>>
  export default src
}
