const User = require("../models/User");
const Sprint = require("../models/Sprint");
const ConnectionRequest = require("../models/ConnectionRequest");
const { embedText } = require("../lib/gemini");
const {
  buildUserEmbeddingText,
  buildSprintEmbeddingText,
} = require("../lib/embedding-helpers");
const { cosineSimilarity, jaccardSimilarity } = require("../lib/similarity");

// --- Helpers to ensure embeddings exist (lazy generation) ---

async function ensureUserEmbedding(user) {
  if (user.embedding && Array.isArray(user.embedding) && user.embedding.length) {
    return user;
  }

  const text = buildUserEmbeddingText(user);
  const vector = await embedText(text);

  // Use updateOne to avoid triggering full document validation
  // This only updates embedding fields without validating enum values
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        embeddingText: text,
        embedding: vector,
      },
    }
  );

  // Update the user object in memory so it has the embedding
  user.embeddingText = text;
  user.embedding = vector;

  return user;
}

async function ensureSprintEmbedding(sprint) {
  if (
    sprint.embedding &&
    Array.isArray(sprint.embedding) &&
    sprint.embedding.length
  ) {
    return sprint;
  }

  const text = buildSprintEmbeddingText(sprint);
  const vector = await embedText(text);

  // Use updateOne to avoid triggering full document validation
  await Sprint.updateOne(
    { _id: sprint._id },
    {
      $set: {
        embeddingText: text,
        embedding: vector,
      },
    }
  );

  // Update the sprint object in memory so it has the embedding
  sprint.embeddingText = text;
  sprint.embedding = vector;

  return sprint;
}

// --- Scoring functions ---

function experienceGapScore(userA, userB) {
  const order = ["Beginner", "Intermediate", "Expert"];
  const idxA = order.indexOf(userA.experienceLevel);
  const idxB = order.indexOf(userB.experienceLevel);

  if (idxA === -1 || idxB === -1) return 0.5;

  const diff = Math.abs(idxA - idxB);
  if (diff === 0) return 1; // same level
  if (diff === 1) return 0.8; // adjacent levels
  return 0.4; // big gap
}

function devDevMatchScore(a, b) {
  const simEmb = cosineSimilarity(a.embedding || [], b.embedding || []);
  const langSim = jaccardSimilarity(
    a.preferredLanguages || [],
    b.preferredLanguages || []
  );
  const skillsSim = jaccardSimilarity(
    a.additionalSkills || [],
    b.additionalSkills || []
  );
  const expScore = experienceGapScore(a, b);

  return (
    0.5 * simEmb + 0.2 * langSim + 0.2 * skillsSim + 0.1 * expScore
  );
}

function devSprintMatchScore(user, sprint) {
  const simEmb = cosineSimilarity(user.embedding || [], sprint.embedding || []);

  const skillCoverage =
    sprint.techStack && sprint.techStack.length
      ? sprint.techStack.filter((t) =>
          (user.preferredLanguages || []).includes(t)
        ).length / sprint.techStack.length
      : 0.5;

  // Feedback tags vs user skills (very rough interest signal)
  const feedbackTags = Array.isArray(sprint.feedback)
    ? sprint.feedback.flatMap((f) => f.tags || [])
    : [];

  const interestAlign = jaccardSimilarity(
    user.additionalSkills || [],
    feedbackTags
  );

  const availabilityScore = user.availability ? 1 : 0.5;

  return (
    0.5 * simEmb +
    0.25 * skillCoverage +
    0.15 * interestAlign +
    0.1 * availabilityScore
  );
}

function buildDevDevReasons(a, b) {
  const reasons = [];

  const langOverlap = (a.preferredLanguages || []).filter((l) =>
    (b.preferredLanguages || []).includes(l)
  );
  if (langOverlap.length) {
    reasons.push(`Shared languages: ${langOverlap.join(", ")}`);
  }

  const skillsOverlap = (a.additionalSkills || []).filter((s) =>
    (b.additionalSkills || []).includes(s)
  );
  if (skillsOverlap.length) {
    reasons.push(`Similar skills: ${skillsOverlap.join(", ")}`);
  }

  if (a.experienceLevel && a.experienceLevel === b.experienceLevel) {
    reasons.push(`Same experience level: ${a.experienceLevel}`);
  }

  if (!reasons.length) {
    reasons.push("Overall profile and experience are similar.");
  }

  return reasons.slice(0, 3);
}

function buildDevSprintReasons(user, sprint) {
  const reasons = [];

  const skillOverlap = (sprint.techStack || []).filter((t) =>
    (user.preferredLanguages || []).includes(t)
  );
  if (skillOverlap.length) {
    reasons.push(`Matches your tech stack: ${skillOverlap.join(", ")}`);
  }

  const feedbackTags = Array.isArray(sprint.feedback)
    ? sprint.feedback.flatMap((f) => f.tags || [])
    : [];

  const extraOverlap = (user.additionalSkills || []).filter((s) =>
    feedbackTags.includes(s)
  );
  if (extraOverlap.length) {
    reasons.push(
      `Aligns with feedback tags / focus areas: ${extraOverlap.join(", ")}`
    );
  }

  reasons.push(
    `Sprint duration: ${
      sprint.duration != null ? sprint.duration + " days" : "not specified"
    }`
  );

  return reasons.slice(0, 3);
}

// --- Public service functions ---

async function getDeveloperMatchesForUser(userId, limit = 5) {
  const currentUser = await User.findById(userId);
  if (!currentUser) {
    throw new Error("User not found");
  }

  await ensureUserEmbedding(currentUser);

  // Get all accepted connections for this user
  const acceptedConnections = await ConnectionRequest.find({
    $or: [
      { fromUser: userId, status: "accepted" },
      { toUser: userId, status: "accepted" },
    ],
  });

  // Extract connected user IDs (as ObjectIds)
  const connectedUserIds = acceptedConnections.map((conn) => {
    const otherUserId =
      conn.fromUser.toString() === userId.toString()
        ? conn.toUser
        : conn.fromUser;
    return otherUserId;
  });

  // Find candidates excluding self and already connected users
  const query = { _id: { $ne: currentUser._id } };
  if (connectedUserIds.length > 0) {
    query._id.$nin = connectedUserIds;
  }
  const candidates = await User.find(query);

  // Ensure embeddings for candidates (in parallel but limited)
  const withEmbeddings = [];
  for (const candidate of candidates) {
    // eslint-disable-next-line no-await-in-loop
    const ensured = await ensureUserEmbedding(candidate);
    withEmbeddings.push(ensured);
  }

  const scored = withEmbeddings
    .map((candidate) => ({
      candidate,
      score: devDevMatchScore(currentUser, candidate),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ candidate, score }) => ({
    partnerId: candidate._id,
    username: candidate.username,
    compatibility: Math.round(score * 100),
    reasons: buildDevDevReasons(currentUser, candidate),
  }));
}

async function getSprintMatchesForUser(userId, limit = 5) {
  const currentUser = await User.findById(userId);
  if (!currentUser) {
    throw new Error("User not found");
  }

  await ensureUserEmbedding(currentUser);

  // Find sprints that are active, not finished, not created by user, and user is not already a member
  const sprints = await Sprint.find({
    isActive: true,
    isFinished: false,
    creator: { $ne: userId }, // Exclude sprints created by the user
  });

  // Filter out sprints where user is already a team member
  const availableSprints = sprints.filter((sprint) => {
    const teamMemberIds = (sprint.teamMembers || []).map((member) =>
      member.toString()
    );
    return !teamMemberIds.includes(userId.toString());
  });

  const withEmbeddings = [];
  for (const sprint of availableSprints) {
    // eslint-disable-next-line no-await-in-loop
    const ensured = await ensureSprintEmbedding(sprint);
    withEmbeddings.push(ensured);
  }

  const scored = withEmbeddings
    .map((sprint) => ({
      sprint,
      score: devSprintMatchScore(currentUser, sprint),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ sprint, score }) => ({
    sprintId: sprint._id,
    title: sprint.title,
    compatibility: Math.round(score * 100),
    reasons: buildDevSprintReasons(currentUser, sprint),
  }));
}

module.exports = {
  getDeveloperMatchesForUser,
  getSprintMatchesForUser,
};


