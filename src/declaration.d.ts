/// <reference types="vite/client" />

// Declarations for image imports
declare module '*.png' {
  const value: string;
  export default value;
}
declare module '*.jpg' {
  const value: string;
  export default value;
}
declare module '*.jpeg' {
  const value: string;
  export default value;
}
declare module '*.gif' {
  const value: string;
  export default value;
}
declare module '*.svg' {
  const value: string;
  export default value;
}

// Declaration for environment variables
interface ImportMetaEnv {
  readonly VITE_AWS_REGION: string;
  readonly VITE_AWS_ACCESS_KEY: string;
  readonly VITE_AWS_SECRET_KEY: string;
  readonly VITE_AWS_S3_BUCKET_NAME: string;
  // Add other variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
