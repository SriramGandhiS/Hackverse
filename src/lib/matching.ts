/**
 * MATCHING ENGINE (CORE LOGIC)
 * 
 * Score = 
 * (CGPA * 0.3) + 
 * (Skill Match % * 0.3) + 
 * (Hackathons * 0.15) + 
 * (Certifications * 0.15) - 
 * (Backlog Penalty * 0.2)
 */

export interface Student {
  id: string;
  name: string;
  dept: string;
  cgpa: number;
  totalBacklogs: number;
  activeBacklogs: number;
  skills: string[];
  hackathons: number;
  certifications: number;
  resume_link?: string;
  githubLink?: string;
  domain?: string;
}

export interface Company {
  id: string;
  name: string;
  requiredSkills: string[];
  prioritySkills: string[];
  minCgpa: number;
  allowedBacklogs: number;
}

export function calculateMatch(student: Student, company: Company) {
  // 1. Filter Check (Base Eligibility)
  const isCgpaEligible = student.cgpa >= company.minCgpa;
  const isBacklogEligible = student.activeBacklogs <= company.allowedBacklogs;

  if (!isCgpaEligible || !isBacklogEligible) {
    return {
      score: 0,
      isEligible: false,
      reasons: [
        !isCgpaEligible && `CGPA ${student.cgpa} below required ${company.minCgpa}`,
        !isBacklogEligible && `${student.activeBacklogs} active backlogs exceeds allowed ${company.allowedBacklogs}`
      ].filter(Boolean) as string[]
    };
  }

  // 2. Skill Match Calculation
  const matchedSkills = student.skills.filter(skill => 
    company.requiredSkills.some(rs => rs.toLowerCase() === skill.toLowerCase())
  );
  
  const skillMatchPercent = company.requiredSkills.length > 0 
    ? (matchedSkills.length / company.requiredSkills.length) * 100 
    : 100;

  // 3. Scoring Components
  const cgpaScore = (student.cgpa / 10) * 100 * 0.3;
  const skillScore = skillMatchPercent * 0.3;
  const hackathonScore = Math.min(student.hackathons * 20, 100) * 0.15; // Cap at 5 hackathons for 100% component
  const certScore = Math.min(student.certifications * 25, 100) * 0.15; // Cap at 4 certs for 100% component
  const backlogPenalty = student.activeBacklogs * 10 * 0.2;

  const totalScore = Math.round(cgpaScore + skillScore + hackathonScore + certScore - backlogPenalty);

  // 4. Explanation Generation
  const explanations = [];
  if (skillMatchPercent >= 80) explanations.push("Strong skill alignment");
  if (student.cgpa >= 8.5) explanations.push("Exceptional academic record");
  if (student.hackathons >= 2) explanations.push("Proven problem-solving drive");
  if (student.activeBacklogs > 0) explanations.push("Active backlog is a risk factor");
  
  const missingPrioritySkills = company.prioritySkills.filter(ps => 
    !student.skills.some(ss => ss.toLowerCase() === ps.toLowerCase())
  );

  return {
    score: Math.max(0, Math.min(100, totalScore)),
    isEligible: true,
    skillMatchPercent,
    matchedSkills,
    missingPrioritySkills,
    explanations
  };
}

export function getRecommendations(student: Student, company: Company) {
  const recommendations = [];
  
  const missingSkills = company.requiredSkills.filter(rs => 
    !student.skills.some(ss => ss.toLowerCase() === rs.toLowerCase())
  );

  if (missingSkills.length > 0) {
    recommendations.push(`Learn ${missingSkills[0]} to increase match by approx. ${Math.round(30 / company.requiredSkills.length)}%`);
  }

  if (student.activeBacklogs > 0) {
    recommendations.push("Clear active backlogs to unlock premium eligibility");
  }

  if (student.certifications < 2) {
    recommendations.push("Add expert certifications to boost profile credibility");
  }

  return recommendations;
}
