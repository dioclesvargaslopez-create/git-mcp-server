# Git MCP Server para VBCS — Guía de instalación y uso

## ¿Qué es esto?
Un servidor MCP personalizado que conecta Claude Desktop con repositorios Git.
Permite a Claude crear, leer y modificar archivos directamente en repos de VBCS
sin que el usuario toque la terminal.

## Cómo funciona el sistema

```
Claude (lenguaje natural)
        ↓
  MCP Server de Git  ←── este repositorio
        ↓
  Carpeta local (Desktop\repos\)
        ↓
  Git push → VBCS / GitHub
        ↓
  Pull en workspace de VBCS → cambios visibles
```

## Requisitos previos
- Windows 10/11
- Node.js v20+ → https://nodejs.org
- Bun → `npm install -g bun`
- Git → https://git-scm.com
- Claude Desktop → https://claude.ai/download

## Paso 1 — Clonar y compilar
```
git clone https://github.com/dioclesvargaslopez-create/git-mcp-server.git C:\Users\TU_USUARIO\Proyectos_MCP\git_mcp_vbcs
cd C:\Users\TU_USUARIO\Proyectos_MCP\git_mcp_vbcs
npm install
npm run build
```

## Paso 2 — Crear run_git_mcp.bat
Crea el archivo `run_git_mcp.bat` en la raíz del servidor. Reemplaza TU_USUARIO, TU_USUARIO_GITHUB y TU_EMAIL:

```
@echo off
cd /d C:\Users\TU_USUARIO\Proyectos_MCP\git_mcp_vbcs
set MCP_TRANSPORT_TYPE=stdio
set MCP_LOG_LEVEL=debug
set GIT_BASE_DIR=C:\Users\TU_USUARIO\Desktop\repos
set GIT_USERNAME=TU_USUARIO_GITHUB
set GIT_EMAIL=TU_EMAIL
set GIT_SIGN_COMMITS=false
node dist/index.js
```

## Paso 3 — Configurar Claude Desktop
Abre Claude → Settings → Developer y añade esto dentro del bloque mcpServers.
Reemplaza TU_USUARIO. Respeta cualquier otro servidor que ya exista:

```json
{
  "mcpServers": {
    "git-vbcs": {
      "command": "C:\\Users\\TU_USUARIO\\Proyectos_MCP\\git_mcp_vbcs\\run_git_mcp.bat",
      "args": []
    }
  },
  "preferences": {
    "coworkWebSearchEnabled": true,
    "coworkScheduledTasksEnabled": false,
    "ccdScheduledTasksEnabled": false
  }
}
```

## Paso 4 — Crear carpeta de repos y clonar referencias
```
mkdir C:\Users\TU_USUARIO\Desktop\repos

# Samples de Oracle como referencia de formato VBCS (obligatorio)
git clone https://github.com/dioclesvargaslopez-create/vbcs-samples.git C:\Users\TU_USUARIO\Desktop\repos\vbcs-samples

# Proyectos de VBCS (credenciales Oracle, se piden una sola vez)
git clone "https://TU_EMAIL%40gmail.com@TU_INSTANCIA.developer.ocp.oraclecloud.com/.../scm/proyecto.git" C:\Users\TU_USUARIO\Desktop\repos\nombre-proyecto
```

## Paso 5 — Reiniciar Claude y verificar
Cierra Claude completamente (bandeja del sistema incluida) y vuelve a abrirlo.
En un chat nuevo pregunta: `¿Qué herramientas MCP tienes disponibles?`
Debes ver `git-vbcs` con tools como `file_write`, `file_read`, `git_push`, etc.

## Flujo de trabajo diario
1. Le dices a Claude qué quieres construir en lenguaje natural
2. Claude lee el sample adecuado de vbcs-samples como referencia de formato
3. Claude crea/modifica los archivos y hace commit + push al repo de VBCS
4. Tú haces Pull en el workspace de VBCS (un clic)
5. Los cambios aparecen en el diseñador

## Repos importantes
- MCP Server personalizado: https://github.com/dioclesvargaslopez-create/git-mcp-server
- VB Samples (referencia): https://github.com/dioclesvargaslopez-create/vbcs-samples
