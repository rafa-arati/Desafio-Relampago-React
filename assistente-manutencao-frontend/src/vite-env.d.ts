// src/vite-env.d.ts (criar este arquivo se não existir)
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    // adicione mais variáveis de ambiente aqui conforme necessário
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}