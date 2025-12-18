# 📝 Configuración de Reglas de Firebase

## 🔥 Firestore Database Rules

Para configurar las reglas de seguridad de Firestore:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **dashboard-ad936**
3. En el menú lateral, ve a **Build** → **Firestore Database**
4. Haz clic en la pestaña **"Reglas"** (Rules)
5. Copia y pega el siguiente código:

\`\`\`javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Trades collection - Allow read/write for all users
    match /trades/{tradeId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if true;
    }
    
    // Default deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
\`\`\`

6. Haz clic en **"Publicar"** o **"Publish"**

---

## 📦 Storage Rules

Para configurar las reglas de seguridad de Storage:

1. En Firebase Console, ve a **Build** → **Storage**
2. Haz clic en la pestaña **"Reglas"** (Rules)
3. Copia y pega el siguiente código:

\`\`\`javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    
    // Trades images - Allow read/write for all users
    match /trades/{tradeId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
      allow delete: if true;
    }
    
    // Default deny all other paths
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
\`\`\`

4. Haz clic en **"Publicar"** o **"Publish"**

---

## ⚠️ Importante

> **Estas reglas permiten acceso público para desarrollo.**
> 
> Para producción, considera implementar Firebase Authentication y restringir el acceso solo a usuarios autenticados.

---

## ✅ Verificación

Después de publicar las reglas, tu aplicación podrá:
- ✅ Guardar trades en Firestore
- ✅ Cargar trades desde Firestore
- ✅ Subir imágenes a Storage
- ✅ Eliminar imágenes de Storage
