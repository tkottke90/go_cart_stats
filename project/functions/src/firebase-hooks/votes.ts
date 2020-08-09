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
          inactive: true
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

          let winner: any = [{ name: '', votes: 0 }];
          Object.keys(ballotBox).forEach( (racer: any) => {
            // Skip racers with no votes
            if (ballotBox[racer] === 0) {
              return;
            }
            
            // If racer has the same number of votes, then add to list
            if (winner[0].votes === ballotBox[racer]) {
              winner.push({ name: racer, votes: ballotBox[racer] })
            }

            // If racer has more votes, reset list and most vote count
            if (ballotBox[racer] > winner[0].votes) {
              winner = [{ name: racer, votes: ballotBox[racer] }];
            }

            // Skip racer if they do not meet the above criteria
            return;
          })

          if (winner.length > 0 && winner[0].name) {
            updateData.winner = winner.map( (racer: any) => racer.name ).join(',') ;
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
        inactive: false,
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