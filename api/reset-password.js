import admin from 'firebase-admin';

const privateKeyPart1 = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDMjfvvMjkIJZR+\n";
const privateKeyPart2 = "80ZLheLZHKmBzrycl/ybApQHQoP1P/DUz84j4U7EPvwZZhKTEZ3kx40xKITIs05X\ncsCPmtTrpX7Os/A1GzGoxGUUN1TYvP3/HNRZaARZNs7F6xOta+dzmUnA7JalLcls\n";
const privateKeyPart3 = "JTPRmsRGJtO2B33VaKMH6FsvVu64+0/Zy/VHthvv6pDWc76mlD918qc7RdvLGpGO\nCBDFwnf9qLT2uFD+9x00+iTdjATB5cCenRzGE+uq3RLSv+a4enfGxTVIVEH2akFM\n";
const privateKeyPart4 = "uht4s8TGcwQ2/4xuSS+JRivj7Bc+EAqdW2Jq2EKBlV4ucVjneNRunCxuzGrhH34K\n/DPLaG1rAgMBAAECggEACRRgU2y6RVdNsRjhTObje9me2IkxrA2/A65ona3hJ5iv\n";
const privateKeyPart5 = "+vJCZytQELvu+r2iI28LwCTvangu9K2o047fZ0BrJQ6Sg2BPUDwlxyT4i54tIPW6\nnIFOF63bS454PSbDF9aLToFGWc7mnOxcXXWFSE+DWM3OZe0NM9TSL76rlX1ZWVKS\n";
const privateKeyPart6 = "E3DAAFvVRLFVQF6B+/rOL6z9mK5q2V+jz3Ct1jNgvIEAuIxrgqyujvBe0b55C27P\n53PMW1XbqlsmYCOoovMb5ybQu6EZmyRVh0f6VBGML6bU9v2YBwd3+F6GPeZNoVzx\n";
const privateKeyPart7 = "AkwYZlksM1pRGTtotwKJTW07vVm5rVkp6bQjPMnRuQKBgQDtoN1sAzFuMOCi4xne\nTYuqmESZzffLbrgyV1NLr/aZ70pjGonAgfwfsYxxFOJhCmNbK9pTKjpUeEIK+gG/\n";
const privateKeyPart8 = "ncgdlPZgq37cYa1Koe7Z3bvr/bzqQiTSL3gZuNAMgGBDp5DrUTMDKhe93uvsGKrf\ndzWAvPjRYiv+I+CBu0YOJUu+nwKBgQDcXoY2zKxQEKcE8g1e8NtVX6T21tGrWiQj\n";
const privateKeyPart9 = "RtsG1XKM1wmkLqDJauxF+RgvVGKj0Cmo7FGh/uwSNOjvy+Qwjhc3aRkz9+5ebnZT\niz6TAPlokB+9Coq7PyAGE3naW31veFlsoYLdlfnvgzMKzz2L+GGSh/c1KCFvMmRG\n";
const privateKeyPart10 = "mOzj1E75tQKBgAWevl3lnW+rvERd9qipUNpSC51Pn8Kx9a1LH2801DJD1JCPeh6R\ndHMTceziv4/n/P2VBe7dms+QoI895nivtKHuef1DURbJQJ35QnrooZ8tOyCXO+O0\n";
const privateKeyPart11 = "t7R0CIejKaOv/N9z5i72+eTFtvK4iqIKYbuPvJrHJZ83HgIzea6v9yClAoGBANY/\n3FNI+Lq7Bfcr8k388/H0FGmcf6sN75aQm//v4/gEVa5XWyGYn/CD9ryFWYWUq/w9\n";
const privateKeyPart12 = "DjzmoNQuts31OHzwmKfZuZQqF4md8dLVzVeVGedMQF9F8Y2NGPBvXQgr7S9EHgUc\nniQbXS09LJH03QzJxut036bBxofawV1V7vKuhr4FAoGBAM6VnqvL/n1crE9ocwOJ\n";
const privateKeyPart13 = "RCahQpg+0usXUGERE6V5trqcHClMZ/VVUkV4Vjtk9Hi9UyMexNI5hT6a/QN2hng0\nwNOiYrhRT0655Iv7nty+er8PNi+NFvafTD12aB1Lr5vXYH+4I5yyN6JUXZS7Bk75\nd4TDL8QdYVQ4snQ9fUzatKDr\n-----END PRIVATE KEY-----\n";

const fullPrivateKey = [
    privateKeyPart1, privateKeyPart2, privateKeyPart3, privateKeyPart4, 
    privateKeyPart5, privateKeyPart6, privateKeyPart7, privateKeyPart8, 
    privateKeyPart9, privateKeyPart10, privateKeyPart11, privateKeyPart12, privateKeyPart13
].join('');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: "uni-eats-3142b",
            clientEmail: "firebase-adminsdk-fbsvc@uni-eats-3142b.iam.gserviceaccount.com",
            privateKey: fullPrivateKey,
        })
    });
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { identifier, newPassword } = req.body;
        if (!identifier || !newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: "Invalid parameters." });
        }

        let uid = null;
        if (identifier.includes('@')) {
            try {
                const userRecord = await admin.auth().getUserByEmail(identifier);
                uid = userRecord.uid;
            } catch (err) {
                return res.status(404).json({ error: "No student account found with this email." });
            }
        } else {
            return res.status(400).json({ error: "Mobile number resetting limited. Please use University Email." });
        }

        await admin.auth().updateUser(uid, { password: newPassword });
        return res.status(200).json({ success: true, message: "Password updated successfully!" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
