import express from 'express';
import highlight from './instance';
import { getHash, verify } from './highlight/validate';
import db from './utils/mysql';
import { set } from './storage/aws-s3';

const router = express.Router();

router.post('/message', async (req, res) => {
  if (!highlight.running) return res.status(500);

  const body = req.body;
  console.log('Set', body);

  // @TODO check format

  // Verify signature
  const isValid = verify(body.address, body.sig, body.data);
  if (!isValid) return res.status(500);

  // Store on AWS S3
  try {
    await set(body.sig, body);
  } catch (e) {
    console.log(e);
    return res.status(500);
  }

  // Index receipt
  try {
    const receipt = {
      sig: body.sig,
      address: body.address,
      hash: getHash(body.data)
    };
    await db.queryAsync('INSERT IGNORE INTO receipts SET ?', [receipt]);
  } catch (e) {
    console.log(e);
    return res.status(500);
  }

  // Gossip to peers
  await highlight.sendAll(body);

  return res.json({ success: true });
});

export default router;
