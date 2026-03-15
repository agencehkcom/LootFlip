import { PrismaClient } from '@prisma/client';
import { TOKEN_CONSTANTS } from '@lootflip/shared';
import { getUserStakingPower } from '../staking/staking.service';

const prisma = new PrismaClient();

export async function createProposal(
  userId: string,
  title: string,
  description: string,
  category: 'GAMEPLAY' | 'CONTENT' | 'ECONOMY',
  options: string[]
) {
  const stakingPower = await getUserStakingPower(userId);
  if (stakingPower < TOKEN_CONSTANTS.MIN_STAKE_FOR_PROPOSAL) {
    throw new Error(`Need at least ${TOKEN_CONSTANTS.MIN_STAKE_FOR_PROPOSAL} GEM staked to propose`);
  }
  if (options.length < 2) throw new Error('Need at least 2 options');
  if (!title.trim()) throw new Error('Title required');

  const endsAt = new Date();
  endsAt.setHours(endsAt.getHours() + TOKEN_CONSTANTS.GOVERNANCE_VOTE_HOURS);

  // Calculate quorum
  const totalStaked = await prisma.stakePosition.aggregate({
    where: { claimedAt: null },
    _sum: { amount: true },
  });
  const quorumRequired = Math.ceil(
    (totalStaked._sum.amount || 0) * TOKEN_CONSTANTS.GOVERNANCE_QUORUM_PERCENT / 100
  );

  return prisma.governanceProposal.create({
    data: {
      title,
      description,
      category,
      options,
      creatorId: userId,
      endsAt,
      quorumRequired: Math.max(quorumRequired, 1),
    },
  });
}

export async function vote(userId: string, proposalId: string, optionIndex: number) {
  const proposal = await prisma.governanceProposal.findUnique({ where: { id: proposalId } });
  if (!proposal) throw new Error('Proposal not found');
  if (proposal.status !== 'ACTIVE') throw new Error('Proposal not active');
  if (new Date() > proposal.endsAt) throw new Error('Voting period ended');

  const options = proposal.options as string[];
  if (optionIndex < 0 || optionIndex >= options.length) throw new Error('Invalid option');

  const votingPower = await getUserStakingPower(userId);
  if (votingPower <= 0) throw new Error('Must have staked GEM to vote');

  return prisma.governanceVote.upsert({
    where: { proposalId_userId: { proposalId, userId } },
    update: { optionIndex, votingPower },
    create: { proposalId, userId, optionIndex, votingPower },
  });
}

export async function getProposals(status?: string) {
  const where: any = {};
  if (status) where.status = status;

  const proposals = await prisma.governanceProposal.findMany({
    where,
    include: {
      creator: { select: { username: true, displayName: true } },
      votes: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return proposals.map(p => {
    const results: Record<number, number> = {};
    let totalVotes = 0;
    for (const v of p.votes) {
      results[v.optionIndex] = (results[v.optionIndex] || 0) + v.votingPower;
      totalVotes += v.votingPower;
    }
    return { ...p, results, totalVotes, votes: undefined };
  });
}

export async function getProposal(proposalId: string) {
  const proposal = await prisma.governanceProposal.findUnique({
    where: { id: proposalId },
    include: {
      creator: { select: { username: true, displayName: true } },
      votes: {
        include: { user: { select: { username: true, displayName: true } } },
      },
    },
  });
  if (!proposal) return null;

  const results: Record<number, number> = {};
  let totalVotes = 0;
  for (const v of proposal.votes) {
    results[v.optionIndex] = (results[v.optionIndex] || 0) + v.votingPower;
    totalVotes += v.votingPower;
  }

  return { ...proposal, results, totalVotes };
}

export async function resolveExpiredProposals() {
  const expired = await prisma.governanceProposal.findMany({
    where: { status: 'ACTIVE', endsAt: { lt: new Date() } },
    include: { votes: true },
  });

  for (const proposal of expired) {
    let totalVotes = 0;
    for (const v of proposal.votes) totalVotes += v.votingPower;

    const status = totalVotes >= proposal.quorumRequired ? 'PASSED' : 'EXPIRED';

    await prisma.governanceProposal.update({
      where: { id: proposal.id },
      data: { status },
    });
  }

  return expired.length;
}
