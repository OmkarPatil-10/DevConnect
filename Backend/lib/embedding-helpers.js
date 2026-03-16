const buildUserEmbeddingText = (user) => {
  const preferredLanguages = Array.isArray(user.preferredLanguages)
    ? user.preferredLanguages.join(", ")
    : "Not specified";

  const additionalSkills = Array.isArray(user.additionalSkills)
    ? user.additionalSkills.join(", ")
    : "None";

  const experience =
    user.experienceYear != null
      ? `${user.experienceYear} years`
      : "Experience not specified";

  return [
    `Developer: ${user.username || "Unknown"}`,
    `Primary languages: ${preferredLanguages}.`,
    `Additional skills: ${additionalSkills}.`,
    `Experience level: ${user.experienceLevel || "Not specified"}.`,
    `Experience: ${experience}.`,
    `Location: ${user.location || "Not specified"}.`,
    `Availability: ${user.availability || "Not specified"}.`,
    `Bio: ${user.bio || "No bio provided."}`,
    `Performance: ${user.performanceSummary || "No performance data yet."}`,
    `Coding style: ${user.codingStyleSummary || "Not described."}`,
  ].join("\n");
};

const buildSprintEmbeddingText = (sprint) => {
  const techStack = Array.isArray(sprint.techStack)
    ? sprint.techStack.join(", ")
    : "Not specified";

  const duration =
    sprint.duration != null ? `${sprint.duration} days` : "Duration not set";

  const feedbackTags = Array.isArray(sprint.feedback)
    ? sprint.feedback.flatMap((f) => f.tags || [])
    : [];

  const uniqueFeedbackTags = [...new Set(feedbackTags)];

  return [
    `Sprint: ${sprint.title || "Untitled sprint"}`,
    `Description: ${sprint.description || "No description"}.`,
    `Required tech stack: ${techStack}.`,
    `Duration: ${duration}.`,
    `Max team size: ${
      sprint.maxTeamSize != null ? sprint.maxTeamSize : "Not specified"
    }.`,
    `Current team skills: ${
      sprint.teamSkillsSummary || "Not summarized yet."
    }`,
    `Feedback tags: ${
      uniqueFeedbackTags.length > 0
        ? uniqueFeedbackTags.join(", ")
        : "No feedback yet."
    }`,
  ].join("\n");
};

module.exports = {
  buildUserEmbeddingText,
  buildSprintEmbeddingText,
};


