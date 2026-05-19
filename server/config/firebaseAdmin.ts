import * as admin from 'firebase-admin';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

const app = admin.apps.length > 0 
  ? admin.apps[0]! 
  : admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });

export const db = admin.firestore(app);

if (firebaseConfig.firestoreDatabaseId) {
  try {
    db.settings({
      databaseId: firebaseConfig.firestoreDatabaseId
    });
    console.log(`[FirebaseAdmin] Standard DB settings assigned for database ID: ${firebaseConfig.firestoreDatabaseId}`);
  } catch (error) {
    console.warn('[FirebaseAdmin] Database settings error:', error);
  }
}

export const auth = admin.auth(app);
export default admin;
