function getLearnerData(courseInfo, assignmentGroup, learnerSubmissions) {
  // Validate course ID
  if (courseInfo.id !== assignmentGroup.course_id) {
    throw new Error("AssignmentGroup does not belong to the specified course.");
  }

  // Create a map to store learner data
  const learnerData = new Map();

  // Process each assignment
  assignmentGroup.assignments.forEach((assignment) => {
    const dueDate = new Date(assignment.due_at);
    const now = new Date();

    // Skip assignments that are not yet due
    if (dueDate > now) return;

    learnerSubmissions.forEach((submission) => {
      if (submission.assignment_id === assignment.id) {
        const learnerId = submission.learner_id;
        const submittedAt = new Date(submission.submission.submitted_at);
        let score = submission.submission.score;

        // Initialize learner data if not exists
        if (!learnerData.has(learnerId)) {
          learnerData.set(learnerId, {
            id: learnerId,
            totalScore: 0,
            totalPossible: 0,
            scores: {},
          });
        }

        const learner = learnerData.get(learnerId);

        // Apply late submission penalty
        if (submittedAt > dueDate) {
          score = Math.max(0, score - 0.1 * assignment.points_possible);
        }

        try {
          // Validate points_possible
          if (
            typeof assignment.points_possible !== "number" ||
            assignment.points_possible <= 0
          ) {
            throw new Error(
              `Invalid points_possible for assignment ${assignment.id}`
            );
          }

          // Calculate percentage score
          const percentageScore = score / assignment.points_possible;

          // Update learner data
          learner.totalScore += score * assignmentGroup.group_weight;
          learner.totalPossible +=
            assignment.points_possible * assignmentGroup.group_weight;
          learner.scores[assignment.id] = percentageScore;
        } catch (error) {
          console.error(
            `Error processing assignment ${assignment.id} for learner ${learnerId}:`,
            error.message
          );
        }
      }
    });
  });

  // Calculate average and format result
  const result = Array.from(learnerData.values()).map((learner) => {
    const avg =
      learner.totalPossible > 0
        ? learner.totalScore / learner.totalPossible
        : 0;
    return {
      id: learner.id,
      avg: Number(avg.toFixed(2)),
      ...learner.scores,
    };
  });

  return result;
}
// document
//   .getElementById("dataForm")
//   .addEventListener("submit", function (event) {
//     event.preventDefault();

//     // Collect data from the form
//     const courseId = parseInt(document.getElementById("courseId").value);
//     const courseName = document.getElementById("courseName").value;

//     const groupId = parseInt(document.getElementById("groupId").value);
//     const groupName = document.getElementById("groupName").value;
//     const courseGroupId = parseInt(
//       document.getElementById("courseGroupId").value
//     );
//     const groupWeight = parseFloat(
//       document.getElementById("groupWeight").value
//     );
//     let assignments;
//     let submissions;

//     try {
//       assignments = JSON.parse(document.getElementById("assignments").value);
//       submissions = JSON.parse(document.getElementById("submissions").value);
//     } catch (error) {
//       alert("Error parsing JSON. Please check your input.");
//       return;
//     }

//     // Validate course ID and assignment group course ID
//     if (courseId !== courseGroupId) {
//       alert("Invalid data: Assignment group does not belong to the course.");
//       return;
//     }

//     const results = getLearnerData(
//       { id: courseId, name: courseName },
//       {
//         id: groupId,
//         name: groupName,
//         course_id: courseGroupId,
//         group_weight: groupWeight,
//         assignments: assignments,
//       },
//       submissions
//     );

//     document.getElementById("results").textContent = JSON.stringify(
//       results,
//       null,
//       2
//     );
//   });

// function getLearnerData(courseInfo, assignmentGroup, learnerSubmissions) {
//   const learners = {};

//   for (const submission of learnerSubmissions) {
//     const learnerId = submission.learner_id;
//     const assignmentId = submission.assignment_id;

//     // Find the related assignment
//     const assignment = assignmentGroup.assignments.find(
//       (a) => a.id === assignmentId
//     );
//     if (!assignment) continue;

//     const dueDate = new Date(assignment.due_at);
//     const submittedAt = new Date(submission.submission.submitted_at);

//     // Skip if the assignment is not yet due
//     if (new Date() < dueDate) continue;

//     // Deduct points if submission is late
//     let score = submission.submission.score;
//     if (submittedAt > dueDate) {
//       score -= assignment.points_possible * 0.1;
//     }

//     const percentage = (score / assignment.points_possible) * 100;

//     // Initialize learner data if not already present
//     if (!learners[learnerId]) {
//       learners[learnerId] = {
//         id: learnerId,
//         avg: 0,
//         totalPoints: 0,
//         totalPossible: 0,
//       };
//     }

//     learners[learnerId][assignmentId] = percentage;
//     learners[learnerId].totalPoints += score;
//     learners[learnerId].totalPossible += assignment.points_possible;
//   }

//   // Calculate weighted average
//   for (const learnerId in learners) {
//     learners[learnerId].avg =
//       (learners[learnerId].totalPoints / learners[learnerId].totalPossible) *
//       100;
//     delete learners[learnerId].totalPoints;
//     delete learners[learnerId].totalPossible;
//   }

//   return Object.values(learners);
// }
