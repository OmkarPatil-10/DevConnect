const User = require("../models/User");
const ConnectionRequest = require("../models/ConnectionRequest");
const {
  getDeveloperMatchesForUser,
  getSprintMatchesForUser,
} = require("../services/ai-match-service");

// Helper: Calculate match score (existing rule-based search)
function calculateMatchScore(user, filters) {
  let score = 0;
  const maxScore = 100;
  
  // Common languages (60% of total score)
  if (filters.preferredLanguages && filters.preferredLanguages.length > 0 && user.preferredLanguages) {
    const commonLangs = user.preferredLanguages.filter(lang => filters.preferredLanguages.includes(lang));
    // Require at least one language match
    if (commonLangs.length === 0) {
      return 0; // No language match, return 0 score
    }
    // Higher score for more language matches
    const languageScore = (commonLangs.length / filters.preferredLanguages.length) * 60;
    score += languageScore;
  }

  // Experience similarity (25% of total score)
  if (filters.experienceYear && user.experienceYear) {
    const diff = Math.abs(user.experienceYear - filters.experienceYear);
    if (diff <= 2) {
      const experienceScore = 25 - (diff * 10); // 25 points for exact match, 15 for 1 year diff, 5 for 2 years
      score += experienceScore;
    }
  }

  // Availability match (15% of total score)
  if (filters.availability && user.availability) {
    if (user.availability === filters.availability) {
      score += 15; // Exact match
    }
  }

  return Math.min(maxScore, score);
}

// Search for matching developers based on filters and ranking (existing endpoint)
exports.searchDevelopers = async (req, res) => {
  try {
    const { experienceYear, preferredLanguages, availability, userId, name } = req.query;
    
    // If searching by name, ignore filters and only search by username
    if (name && name.trim()) {
      const nameRegex = new RegExp(name.trim(), "i"); // case-insensitive, partial match
      const users = await User.find({
        _id: { $ne: userId },
        username: { $regex: nameRegex }
      }).lean();

      // Get connection status for each user
      const usersWithStatus = await Promise.all(users.map(async (user) => {
        const connection = await ConnectionRequest.findOne({
          $or: [
            { fromUser: userId, toUser: user._id },
            { fromUser: user._id, toUser: userId }
          ]
        });
        
        return {
          ...user,
          connectionStatus: connection ? connection.status : "none",
        };
      }));

      return res.json({
        success: true,
        users: usersWithStatus,
        filters: {},
        message: users.length > 0 ? 'Found developers by name' : 'No developers found by name'
      });
    }

    // Validate and process filters
    const filters = {
      experienceYear: experienceYear ? Number(experienceYear) : null,
      preferredLanguages: preferredLanguages ? 
        (Array.isArray(preferredLanguages) ? preferredLanguages : [preferredLanguages]) : 
        [],
      availability: availability || null,
    };

    // First, find all users with matching languages
    let users = [];
    if (filters.preferredLanguages && filters.preferredLanguages.length > 0) {
      users = await User.find({
        _id: { $ne: userId },
        preferredLanguages: { $in: filters.preferredLanguages },
      }).lean();

      // If no users found with matching languages, return empty result
      if (users.length === 0) {
        return res.json({ 
          success: true, 
          users: [],
          filters: filters,
          message: 'No developers found with matching languages'
        });
      }
    } else {
      // If no languages specified, get all users except self
      users = await User.find({ _id: { $ne: userId } }).lean();
    }

    // Filter by experience if specified
    if (filters.experienceYear) {
      users = users.filter((user) =>
        user.experienceYear >= Math.max(0, filters.experienceYear - 2) && 
        user.experienceYear <= filters.experienceYear + 2
      );
    }

    const hasFilters = filters.experienceYear || (filters.preferredLanguages && filters.preferredLanguages.length > 0) || filters.availability;

    // Calculate match scores and add connection status
    const ranked = await Promise.all(
      users
        .map((u) => ({
        ...u, 
        matchScore: hasFilters ? calculateMatchScore(u, filters) : 100,
          matchingLanguages:
            filters.preferredLanguages && filters.preferredLanguages.length > 0
              ? u.preferredLanguages.filter((lang) =>
                  filters.preferredLanguages.includes(lang)
                )
              : [],
      }))
        .filter((u) => !hasFilters || u.matchScore > 20) // Only show matches with score > 20% if filters active
      .sort((a, b) => {
        // First sort by number of matching languages
          const langDiff =
            b.matchingLanguages.length - a.matchingLanguages.length;
        if (langDiff !== 0) return langDiff;
        // Then by match score
        return b.matchScore - a.matchScore;
        })
    );

    // Get connection status for each user
    const rankedWithStatus = await Promise.all(
      ranked.map(async (user) => {
      const connection = await ConnectionRequest.findOne({
        $or: [
          { fromUser: userId, toUser: user._id },
            { fromUser: user._id, toUser: userId },
          ],
      });
      
      return {
        ...user,
          connectionStatus: connection ? connection.status : "none",
      };
      })
    );

    res.json({ 
      success: true, 
      users: rankedWithStatus,
      filters: filters,
      message:
        ranked.length > 0
          ? "Found matching developers"
          : "No matching developers found",
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      message: 'Error occurred while searching for developers'
    });
  }
};

// --- New: AI-powered developer partner recommendations using Gemini embeddings ---
exports.getAIDeveloperMatches = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId query param is required" });
    }

    const matches = await getDeveloperMatchesForUser(userId);

    return res.json({
      success: true,
      message:
        matches.length > 0
          ? "AI developer matches generated successfully"
          : "No suitable developer matches found",
      matches,
    });
  } catch (err) {
    console.error("AI developer match error:", err);
    res.status(500).json({
      success: false,
      message: "Error occurred while generating AI developer matches",
      error: err.message,
    });
  }
};

// --- New: AI-powered sprint recommendations using Gemini embeddings ---
exports.getAISprintMatches = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId query param is required" });
    }

    const matches = await getSprintMatchesForUser(userId);

    return res.json({
      success: true,
      message:
        matches.length > 0
          ? "AI sprint matches generated successfully"
          : "No suitable sprint matches found",
      matches,
    });
  } catch (err) {
    console.error("AI sprint match error:", err);
    res.status(500).json({
      success: false,
      message: "Error occurred while generating AI sprint matches",
      error: err.message,
    });
  }
};

// --- Helper: Get all users (for testing - to get userIds) ---
exports.getAllUsersForTesting = async (req, res) => {
  try {
    const users = await User.find({})
      .select("_id username email experienceLevel preferredLanguages additionalSkills")
      .lean();

    return res.json({
      success: true,
      message: `Found ${users.length} users`,
      users: users.map((u) => ({
        userId: u._id,
        username: u.username,
        email: u.email,
        experienceLevel: u.experienceLevel,
        preferredLanguages: u.preferredLanguages,
        additionalSkills: u.additionalSkills,
      })),
    });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: err.message,
    });
  }
};

// Send a connection request
exports.sendConnectionRequest = async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;

    // Validate users exist
    const [fromUser, toUser] = await Promise.all([
      User.findById(fromUserId),
      User.findById(toUserId)
    ]);

    if (!fromUser || !toUser) {
      return res.status(404).json({
        success: false,
        message: 'One or both users not found'
      });
    }

    // Check if request already exists
    const existingRequest = await ConnectionRequest.findOne({
      fromUser: fromUserId,
      toUser: toUserId
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Connection request already exists'
      });
    }

    // Create new connection request
    const connectionRequest = new ConnectionRequest({
      fromUser: fromUserId,
      toUser: toUserId
    });

    await connectionRequest.save();

    res.json({
      success: true,
      message: 'Connection request sent successfully'
    });
  } catch (err) {
    console.error('Error sending connection request:', err);
    res.status(500).json({
      success: false,
      message: 'Error sending connection request'
    });
  }
};

// Accept a connection request
exports.acceptConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId } = req.body; // The user accepting the request

    const request = await ConnectionRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }

    if (request.toUser.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this request'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request is no longer pending'
      });
    }

    request.status = 'accepted';
    await request.save();

    res.json({
      success: true,
      message: 'Connection request accepted'
    });
  } catch (err) {
    console.error('Error accepting connection request:', err);
    res.status(500).json({
      success: false,
      message: 'Error accepting connection request'
    });
  }
};

// Get pending connection requests for a user
exports.getPendingRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    const requests = await ConnectionRequest.find({
      toUser: userId,
      status: 'pending'
    }).populate('fromUser', 'username profilePicture experienceYear preferredLanguages availability');

    res.json({
      success: true,
      requests
    });
  } catch (err) {
    console.error('Error fetching pending requests:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending requests'
    });
  }
};

// Get all connections for a user
exports.getConnections = async (req, res) => {
  try {
    const { userId } = req.params;

    const connections = await ConnectionRequest.find({
      $or: [
        { fromUser: userId },
        { toUser: userId }
      ],
      status: 'accepted'
    }).populate('fromUser toUser', 'username profilePicture experienceYear preferredLanguages availability');

    // Format the response to show connected users
    const connectedUsers = connections.map(conn => {
      const connectedUser = conn.fromUser._id.toString() === userId ? conn.toUser : conn.fromUser;
      return {
        ...connectedUser.toObject(),
        connectionId: conn._id
      };
    });

    res.json({
      success: true,
      connections: connectedUsers
    });
  } catch (err) {
    console.error('Error fetching connections:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching connections'
    });
  }
};

// Reject a connection request
exports.rejectConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId } = req.body; // The user rejecting the request

    const request = await ConnectionRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }

    if (request.toUser.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this request'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request is no longer pending'
      });
    }

    // Delete the request instead of marking as rejected
    // This allows the sender to send a new request in the future
    await ConnectionRequest.findByIdAndDelete(requestId);

    res.json({
      success: true,
      message: 'Connection request rejected'
    });
  } catch (err) {
    console.error('Error rejecting connection request:', err);
    res.status(500).json({
      success: false,
      message: 'Error rejecting connection request'
    });
  }
};

// Get sent connection requests for a user
exports.getSentRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    const requests = await ConnectionRequest.find({
      fromUser: userId,
      status: 'pending'
    }).populate('toUser', 'username profilePicture experienceYear preferredLanguages availability');

    res.json({
      success: true,
      requests
    });
  } catch (err) {
    console.error('Error fetching sent requests:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching sent requests'
    });
  }
};

// Cancel a sent connection request
exports.cancelConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId } = req.body; // The user canceling the request

    const request = await ConnectionRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }

    if (request.fromUser.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this request'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request is no longer pending'
      });
    }

    // Delete the request
    await ConnectionRequest.findByIdAndDelete(requestId);

    res.json({
      success: true,
      message: 'Connection request canceled'
    });
  } catch (err) {
    console.error('Error canceling connection request:', err);
    res.status(500).json({
      success: false,
      message: 'Error canceling connection request'
    });
  }
};

// Remove a connection
exports.removeConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { userId } = req.body; // The user removing the connection

    const connection = await ConnectionRequest.findById(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    if (connection.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Connection is not active'
      });
    }

    // Verify the user is part of this connection
    if (connection.fromUser.toString() !== userId && connection.toUser.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this connection'
      });
    }

    // Delete the connection
    await ConnectionRequest.findByIdAndDelete(connectionId);

    res.json({
      success: true,
      message: 'Connection removed successfully'
    });
  } catch (err) {
    console.error('Error removing connection:', err);
    res.status(500).json({
      success: false,
      message: 'Error removing connection'
    });
  }
}; 