import "dotenv/config";
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import mongoose from "mongoose";
import User from "./models/User.js";
import Issue from "./models/Issue.js";
import Vote from "./models/Vote.js";

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/community-hero";

// --------------- Lucknow Locations ---------------

const LUCKNOW_LOCATIONS = [
  { name: "Hazratganj", lat: 26.8506, lng: 80.9467 },
  { name: "Gomti Nagar", lat: 26.8563, lng: 80.9832 },
  { name: "Aminabad", lat: 26.8452, lng: 80.9327 },
  { name: "Chowk", lat: 26.8618, lng: 80.9258 },
  { name: "Alambagh", lat: 26.8152, lng: 80.9177 },
  { name: "Indira Nagar", lat: 26.8756, lng: 80.9913 },
  { name: "Aliganj", lat: 26.8876, lng: 80.9433 },
  { name: "Mahanagar", lat: 26.8735, lng: 80.9395 },
  { name: "Husainabad", lat: 26.8678, lng: 80.9195 },
  { name: "Charbagh", lat: 26.8340, lng: 80.9190 },
  { name: "Kaiserbagh", lat: 26.8495, lng: 80.9380 },
  { name: "Rajajipuram", lat: 26.8572, lng: 80.9080 },
  { name: "Vikas Nagar", lat: 26.8390, lng: 80.9590 },
  { name: "Jankipuram", lat: 26.9020, lng: 80.9477 },
  { name: "Chinhat", lat: 26.8710, lng: 81.0100 },
  { name: "Ashiyana", lat: 26.7950, lng: 80.9380 },
  { name: "Cantt Area", lat: 26.8380, lng: 80.9450 },
  { name: "Nirala Nagar", lat: 26.8648, lng: 80.9560 },
  { name: "Lalbagh", lat: 26.8560, lng: 80.9220 },
  { name: "Daliganj", lat: 26.8812, lng: 80.9350 },
];

// --------------- Category Descriptions ---------------

const ISSUE_TEMPLATES = {
  pothole: [
    "Large pothole on the main road causing traffic issues",
    "Deep pothole near the bus stop endangering pedestrians",
    "Multiple potholes on the service lane making driving hazardous",
    "Crater-sized pothole filled with rainwater on the highway",
    "Series of potholes near the school zone requiring urgent repair",
    "Pothole on the bridge approach road causing vehicle damage",
    "Expanding pothole near the market area",
  ],
  garbage: [
    "Overflowing garbage bin attracting stray animals",
    "Illegal waste dump near the residential colony",
    "Construction debris blocking the sidewalk",
    "Pile of garbage near the drain causing water logging",
    "Uncollected garbage for over a week in the neighborhood",
    "Open waste burning near the park",
    "Plastic waste accumulation near the river bank",
  ],
  streetlight: [
    "Street light not working for the past two weeks",
    "Flickering street light creating unsafe conditions at night",
    "Broken street light pole leaning dangerously",
    "Entire lane of street lights are non-functional",
    "Street light damaged after recent storm",
    "New street light installation needed in dark stretch",
    "Exposed wiring on the street light pole",
  ],
  water_leak: [
    "Major water pipeline leak flooding the road",
    "Continuous water leak from the overhead tank",
    "Fire hydrant leaking water for days",
    "Underground pipe burst causing road cave-in",
    "Water logging due to blocked drainage",
    "Sewage overflow near the residential area",
    "Broken water meter leaking continuously",
  ],
  road_damage: [
    "Road surface completely eroded after monsoon",
    "Missing road divider creating accident-prone zone",
    "Broken speed breaker causing vehicle damage",
    "Road edge crumbling near the canal",
    "Damaged pedestrian crossing markings",
    "Missing road signs at the busy intersection",
    "Broken guardrail on the elevated road",
  ],
  other: [
    "Damaged park bench in the community garden",
    "Broken public toilet facility needs repair",
    "Stray animal menace in the locality",
    "Noise pollution from illegal construction",
    "Encroachment on the public footpath",
    "Damaged public water fountain",
    "Broken boundary wall of the community park",
  ],
};

const CATEGORIES = [
  "pothole",
  "garbage",
  "streetlight",
  "water_leak",
  "road_damage",
  "other",
];
const SEVERITIES = ["low", "medium", "high"];
const STATUSES = [
  "reported",
  "verified",
  "in_progress",
  "resolved_pending_verification",
  "resolved",
];

// --------------- Helpers ---------------

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysAgo) {
  const now = Date.now();
  const past = now - daysAgo * 24 * 60 * 60 * 1000;
  return new Date(randomBetween(past, now));
}

function scatteredCoord(base, range) {
  return base + randomBetween(-range, range);
}

// --------------- Seed ---------------

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Vote.deleteMany({});
    await Issue.deleteMany({});
    await User.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Create seed users
    const users = await User.insertMany([
      {
        googleId: "seed-citizen-1",
        name: "Rahul Sharma",
        email: "rahul.sharma@gmail.com",
        photoUrl: "https://ui-avatars.com/api/?name=Rahul+Sharma&background=4CAF50&color=fff",
        role: "citizen",
      },
      {
        googleId: "seed-citizen-2",
        name: "Priya Gupta",
        email: "priya.gupta@gmail.com",
        photoUrl: "https://ui-avatars.com/api/?name=Priya+Gupta&background=2196F3&color=fff",
        role: "citizen",
      },
      {
        googleId: "seed-admin-1",
        name: "Amit Kumar (LMC Admin)",
        email: "admin@example.com",
        photoUrl: "https://ui-avatars.com/api/?name=Amit+Kumar&background=FF5722&color=fff",
        role: "org_admin",
      },
    ]);

    console.log(`👤 Created ${users.length} users`);

    const citizens = [users[0], users[1]];
    const admin = users[2];

    // Status distribution: 10 reported, 8 verified, 8 in_progress, 7 resolved_pending_verification, 7 resolved
    const statusDistribution = [
      ...Array(10).fill("reported"),
      ...Array(8).fill("verified"),
      ...Array(8).fill("in_progress"),
      ...Array(7).fill("resolved_pending_verification"),
      ...Array(7).fill("resolved"),
    ];

    // Shuffle
    for (let i = statusDistribution.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [statusDistribution[i], statusDistribution[j]] = [
        statusDistribution[j],
        statusDistribution[i],
      ];
    }

    const issues = [];

    for (let i = 0; i < 40; i++) {
      const loc = LUCKNOW_LOCATIONS[i % LUCKNOW_LOCATIONS.length];
      const category = CATEGORIES[i % CATEGORIES.length];
      const templates = ISSUE_TEMPLATES[category];
      const description = templates[i % templates.length];
      const status = statusDistribution[i];
      const severity = SEVERITIES[i % SEVERITIES.length];
      const citizenFixable =
        category === "garbage" || category === "other"
          ? Math.random() > 0.4
          : Math.random() > 0.8;
      const reporter = randomPick(citizens);
      const createdAt = randomDate(30);

      const issueData = {
        reporterId: reporter._id,
        photoUrl: `https://placehold.co/600x400/3B5BDB/FFFFFF?text=${category.toUpperCase()}`,
        description: `${description} near ${loc.name}`,
        location: {
          type: "Point",
          coordinates: [
            scatteredCoord(loc.lng, 0.005),
            scatteredCoord(loc.lat, 0.005),
          ],
        },
        category,
        severity,
        citizenFixable,
        aiDescription: description,
        status,
        disputed: false,
        createdAt,
        updatedAt: createdAt,
      };

      // Add resolution data for resolved / resolved_pending_verification issues
      if (
        status === "resolved" ||
        status === "resolved_pending_verification"
      ) {
        issueData.resolutionProofUrl = `https://placehold.co/600x400/37B24D/FFFFFF?text=RESOLVED`;
        issueData.resolvedBy = admin._id;
      }

      issues.push(issueData);
    }

    const createdIssues = await Issue.insertMany(issues);
    console.log(`📋 Created ${createdIssues.length} issues`);

    // Create votes
    const allVoterIds = [users[0]._id, users[1]._id, users[2]._id];
    const votes = [];

    for (const issue of createdIssues) {
      const reporterIdStr = issue.reporterId.toString();

      // Determine vote counts based on status
      if (issue.status === "reported") {
        // 0-4 net votes for report_verification
        const netTarget = Math.floor(Math.random() * 5); // 0 to 4
        const upvotes = netTarget;
        let voteCount = 0;
        for (const voterId of allVoterIds) {
          if (voterId.toString() === reporterIdStr) continue; // reporter can't vote on own issue
          if (voteCount >= upvotes) break;
          votes.push({
            userId: voterId,
            issueId: issue._id,
            value: 1,
            stage: "report_verification",
            createdAt: new Date(issue.createdAt.getTime() + Math.random() * 86400000),
          });
          voteCount++;
        }
      } else if (
        issue.status === "verified" ||
        issue.status === "in_progress"
      ) {
        // 5-8 net votes for report_verification
        const netTarget = 5 + Math.floor(Math.random() * 4); // 5 to 8
        // We only have 3 users, so max distinct votes = 2 (reporter excluded)
        // Add votes from non-reporter users
        let voteCount = 0;
        for (const voterId of allVoterIds) {
          if (voterId.toString() === reporterIdStr) continue;
          if (voteCount >= netTarget) break;
          votes.push({
            userId: voterId,
            issueId: issue._id,
            value: 1,
            stage: "report_verification",
            createdAt: new Date(issue.createdAt.getTime() + Math.random() * 86400000),
          });
          voteCount++;
        }
      } else if (issue.status === "resolved_pending_verification") {
        // 5+ report verification votes
        for (const voterId of allVoterIds) {
          if (voterId.toString() === reporterIdStr) continue;
          votes.push({
            userId: voterId,
            issueId: issue._id,
            value: 1,
            stage: "report_verification",
            createdAt: new Date(issue.createdAt.getTime() + Math.random() * 86400000),
          });
        }
        // 0-2 resolution verification votes
        const resVotes = Math.floor(Math.random() * 3); // 0 to 2
        let resCount = 0;
        for (const voterId of allVoterIds) {
          if (resCount >= resVotes) break;
          votes.push({
            userId: voterId,
            issueId: issue._id,
            value: 1,
            stage: "resolution_verification",
            createdAt: new Date(issue.createdAt.getTime() + Math.random() * 172800000),
          });
          resCount++;
        }
      } else if (issue.status === "resolved") {
        // 5+ report verification votes
        for (const voterId of allVoterIds) {
          if (voterId.toString() === reporterIdStr) continue;
          votes.push({
            userId: voterId,
            issueId: issue._id,
            value: 1,
            stage: "report_verification",
            createdAt: new Date(issue.createdAt.getTime() + Math.random() * 86400000),
          });
        }
        // 3+ resolution verification votes
        for (const voterId of allVoterIds) {
          votes.push({
            userId: voterId,
            issueId: issue._id,
            value: 1,
            stage: "resolution_verification",
            createdAt: new Date(issue.createdAt.getTime() + Math.random() * 172800000),
          });
        }
      }
    }

    if (votes.length > 0) {
      // Use ordered: false to skip any duplicates from the compound index
      try {
        const createdVotes = await Vote.insertMany(votes, { ordered: false });
        console.log(`🗳️  Created ${createdVotes.length} votes`);
      } catch (err) {
        if (err.insertedDocs) {
          console.log(`🗳️  Created ${err.insertedDocs.length} votes (some duplicates skipped)`);
        } else {
          console.log(`🗳️  Created votes (some duplicates may have been skipped)`);
        }
      }
    }

    // Print summary
    console.log("\n📊 Seed Summary:");
    console.log("─".repeat(40));
    for (const status of STATUSES) {
      const count = createdIssues.filter((i) => i.status === status).length;
      console.log(`  ${status.padEnd(35)} ${count}`);
    }
    console.log("─".repeat(40));
    console.log(`  ${"Total".padEnd(35)} ${createdIssues.length}`);

    console.log("\n📂 Category Distribution:");
    console.log("─".repeat(40));
    for (const cat of CATEGORIES) {
      const count = createdIssues.filter((i) => i.category === cat).length;
      console.log(`  ${cat.padEnd(35)} ${count}`);
    }

    console.log("\n✅ Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
