function getLearnerData(courseInfo, assignmentGroup, learnerSubmissions) {
  // Check if the course and assignment group match
  if (courseInfo.id !== assignmentGroup.course_id) {
    throw new Error("Course and assignment group don't match");
  }

  // Create a list of assignments with their weights and due dates
  const weightedAssignments = assignmentGroup.assignments.map((assignment) => ({
    id: assignment.id,
    weight: (assignment.points_possible * assignmentGroup.group_weight) / 100,
    dueAt: new Date(assignment.due_at),
  }));

  // Group learners by their ID and calculate scores
  const learnersData = learnerSubmissions.reduce((result, submission) => {
    const {
      learner_id,
      assignment_id,
      submission: { submitted_at, score },
    } = submission;
    const learner = result[learner_id] || {
      id: learner_id,
      scores: {},
      totalWeight: 0,
      totalScore: 0,
    };
    const assignment = weightedAssignments.find((a) => a.id === assignment_id);

    if (!assignment) {
      console.error(
        `Assignment ${assignment_id} not found for learner ${learner_id}`
      );
      return result;
    }

    const isLate = new Date(submitted_at) > assignment.dueAt;
    const adjustedScore = isLate ? score * 0.9 : score; 

    learner.scores[assignment_id] = adjustedScore / assignment.points_possible;
    learner.totalWeight += assignment.weight;
    learner.totalScore += adjustedScore * assignment.weight;

    result[learner_id] = learner;
    return result;
  }, {});

  // Calculate average scores for each learner
  const output = Object.values(learnersData).map((learner) => ({
    id: learner.id,
    avg: learner.totalWeight > 0 ? learner.totalScore / learner.totalWeight : 0,
    ...learner.scores,
  }));

  return output;

}
// const result = getLearnerData(CourseInfo, AssignmentGroup, LearnerSubmissions);
// console.log(result);
  