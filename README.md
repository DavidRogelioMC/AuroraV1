# AURORA - Plataforma React con AWS Cognito + Bedrock + Amplify

## 📦 Instalación local

```bash
git clone https://github.com/tuusuario/aurora.git
cd aurora
npm install
cp .env.example .env
```

### Iniciar desarrollo

```bash
npm run dev
```

## 🚀 Despliegue en AWS Amplify

1. Subir el repositorio a GitHub.
2. Ir a [Amplify Console](https://console.aws.amazon.com/amplify/home).
3. Seleccionar **New App > Host web app**.
4. Conectar con GitHub y seleccionar el repositorio.
5. En **Build Settings**, usar:
   - Framework: `Vite`
   - Output Directory: `dist`
   - Build Command: `npm run build`

6. Añadir variables de entorno (`VITE_...`) en el panel de Amplify.
7. Click en Deploy.

## 🔐 Autenticación

Se usa **AWS Cognito** para el login. El token `id_token` se maneja en el `localStorage` y controla el acceso al contenido.

## ☁️ Backend

- **API Gateway + Lambda**: procesamiento de preguntas/respuestas.
- **DynamoDB**: almacenamiento de historial de chat.
- **S3**: subida de imágenes de perfil.
- **Amazon Bedrock**: IA generativa integrada.

## 📂 Estructura del Proyecto

```
/src
 ├── App.jsx
 ├── components/
 │    ├── Sidebar.jsx
 │    ├── ChatModal.jsx
 │    └── ProfileModal.jsx
 ├── assets/
 │    └── default.jpg, Netec.png, Previw.png
 ├── index.css
 └── main.jsx
```

---

Proyecto desarrollado por [Netec.com](https://netec.com) 🚀