# Firebase Admin SDK Setup for RootED Backend

The backend uses Firebase Admin SDK to write conversations and user progress to Firestore.

## Setup Steps

### 1. Generate Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `rooted-b8903`
3. Click the gear icon → **Project Settings**
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Save the JSON file

### 2. Deploy to EC2

Copy the credentials file to your EC2 instance:

```bash
# From your local machine
scp -i your-key.pem firebase-credentials.json ec2-user@13.61.162.222:/home/ec2-user/rooted/

# On EC2, move to the app directory
ssh -i your-key.pem ec2-user@13.61.162.222
sudo mv /home/ec2-user/rooted/firebase-credentials.json /app/firebase-credentials.json
sudo chmod 600 /app/firebase-credentials.json
```

### 3. Environment Variable (Alternative)

Instead of a file, you can set the credentials path:

```bash
export FIREBASE_CREDENTIALS_PATH=/path/to/firebase-credentials.json
```

Or for Docker:

```dockerfile
ENV FIREBASE_CREDENTIALS_PATH=/app/firebase-credentials.json
```

### 4. Verify Setup

After deploying, check the backend logs:

```bash
docker logs rooted-backend
```

You should see:
```
Firebase initialized with credentials from /app/firebase-credentials.json
Firestore client initialized successfully
```

## Security Notes

- **Never commit** the service account JSON to git
- Add `firebase-credentials.json` to `.gitignore`
- Use environment variables in production
- Restrict the service account to only necessary permissions

## Firestore Security Rules

Since the backend uses Admin SDK (bypasses rules), ensure your rules allow frontend reads:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Backend only

      match /progress/{doc} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if false; // Backend only
      }
    }

    // Users can read their own conversations
    match /conversations/{convId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if false; // Backend only
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## Troubleshooting

### "Firebase initialization failed"
- Check if the credentials file exists at the specified path
- Verify the JSON file is valid
- Ensure proper file permissions (readable by the app)

### "Conversations will be stored in memory only"
- This means Firebase init failed, check logs for errors
- The app will still work but data won't persist
