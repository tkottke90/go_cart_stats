import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export default function (adminSDK: admin.app.App) {

  const modifyNewVoteDocument = functions.firestore.document('/votes/{docId}').onCreate(async (document: admin.firestore.DocumentSnapshot) => {
    try {
      const db = admin.firestore();
      const data: any = document.data();

      if (!data || !data.date) {
        return;
      }

      const timestamp = new Date(data.date).valueOf();

      const today = new Date();
      const today_beginning = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const todaysVotes = await db
        .collection('votes')
        .where("voter", "==", data.voter)
        .where("timestamp", ">=", today_beginning.valueOf())
        .get();


     todaysVotes.docs.forEach( async doc => {
        doc.ref.update({
          active: false
        })
      });

      const reportDocument = `dailyVotes/${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      const dailyReport = await db.doc(reportDocument).get()
      const reportData = dailyReport.data();
      if (reportData) {
        // Find user
        try {
          const index = reportData.votes.findIndex( (item: any) => item.voter === data.voter);
          
          const updateData: any = {
            votes: reportData.votes
          };
  
          // If user exists update record, else add new record
          if (index !== -1) {
            updateData.votes[index] = data;
          } else {
            updateData.votes.push(data);
            updateData.count = reportData.count + 1;
          }
  
          // Collect votes
          const ballotBox: { [key: string]: number } = {};
          reportData.votes.forEach( (vote: any) => ballotBox[vote.ballot] = ballotBox[vote.ballot] ? ballotBox[vote.ballot] + 1 : 1 );
  
          console.dir({ballotBox});

          const winner: any = { winner: '', votes: 0 };
          Object.keys(ballotBox).forEach( (racer: any) => {
            if (ballotBox[racer] > winner.votes) {
              winner.winner = racer;
              winner.votes = ballotBox[racer];
            }
          })

          if (winner.winner) {
            updateData.winner = winner.winner;
          }

          dailyReport.ref.update(updateData);

        } catch (err) {
          functions.logger.error(err);
        }
      } else {
        db
          .doc(`dailyVotes/${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`)
          .set({
            votes: [ data ],
            count: 1,
            result: data.ballot,
            open: true,
            lastUpdated: timestamp
          });
      }


      return document.ref.update({
        active: true,
        timestamp
      });
    } catch (error) {
      functions.logger.error('Could not modify document', { id: document.id, ...error })
    }

    return;
  });

  return {
    modifyNewVoteDocument
  }
}