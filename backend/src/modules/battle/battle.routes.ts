import { Router } from 'express';
import { getBattle } from './battle.service';

export const battleRouter = Router();

battleRouter.get('/:id', async (req, res) => {
  const battle = await getBattle(req.params.id);
  if (!battle) {
    return res.status(404).json({ success: false, error: 'Battle not found' });
  }
  res.json({ success: true, data: battle });
});
