import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const sortRaces = (one: any, two: any) => {
  // If either are missing the time property, return
  if (!one.time || !two.time) {
    return 0;
  }

  if (one.time < two.time) {
  	return -1;
  }
  
  if (one.time > two.time) {
  	return 1;
  }
  
  return 0;
}

export default function (adminSDK: admin.app.App) {
  const modifyNewRaceDocument = functions.firestore.document('/races/{docId}').onCreate(async (document: admin.firestore.DocumentSnapshot) => {
    //   // Setup
    const db = admin.firestore();
    const rtdb = admin.database();
    // const data: any = document.data();

    functions.logger.info('Created Race');
    const data: any = document.data();

    // Get configured track
      // Get configruration
      const trackConfig: any = await rtdb.ref('trackConfig').once('value') || { track: 'OG' };
  
      // Get track document
      const doc = await db.collection('tracks').doc(trackConfig.track).get()
      let trackDoc: any = doc.data();      

      // If track is false, create record
      if (!trackDoc) {
        trackDoc = {
          name: trackConfig.track,
          thumbnail: '',
          hotLaps: []
        }
      }

    // Apply track to race
    trackDoc.hotLaps.push({ time: data.bestTime, racer: data.userId, date: data.date });
    
    // Sort Hot Laps
    trackDoc.hotLaps.sort(sortRaces);
    
    // Limit laps to top 10
    if (trackDoc.hotlaps.length > 10) {
      trackDoc.hotlaps.length = 10;
    }

    // Update track document with best laps
    doc.ref.update(trackDoc);

    document.ref.update({
      track: trackConfig.track
    })

    return;
  });

  return {
    modifyNewRaceDocument
  }
}