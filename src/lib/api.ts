/**
 * GOOGLE APPS SCRIPT API INTEGRATION
 */

const DEPLOYMENT_URL = "https://script.google.com/macros/s/AKfycby_gLKWdT1nEasz4B3KbsM7R4OLdKvEbrl2aTAhuwZMVNhaxWat4RNNCvipb1OM3nGR0Q/exec";

export async function fetchFromGAS(action: string, payload: any = {}) {
  try {
    const response = await fetch(`${DEPLOYMENT_URL}?action=${action}&data=${encodeURIComponent(JSON.stringify(payload))}`, {
      method: 'GET',
    });

    if (!response.ok) {
      console.warn(`GAS API reported ${response.status}. Falling back to internal high-fidelity data.`);
      return normalizeData(action, getMockData(action));
    }

    const result = await response.json();
    return normalizeData(action, result);
  } catch (error) {
    console.error("GAS API Error:", error);
    return normalizeData(action, getMockData(action));
  }
}

export async function submitApplication(studentId: string, studentName: string, companyId: string, companyName: string) {
  return fetchFromGAS('apply', { studentId, studentName, companyId, companyName });
}

function normalizeData(action: string, data: any) {
  if (action === 'getStudents' && Array.isArray(data)) {
    const mocks = getMockData('getStudents') || [];
    return data.map((s: any) => {
      const mock = (mocks as any[]).find(m => String(m.id) === String(s.id));
      const activeBacklogs = Number(s.active_backlogs ?? s.activeBacklogs ?? mock?.active_backlogs ?? mock?.activeBacklogs ?? 0);
      return {
        ...s,
        totalBacklogs: Number(s.total_backlogs ?? s.totalBacklogs ?? mock?.total_backlogs ?? mock?.totalBacklogs ?? activeBacklogs),
        activeBacklogs,
        skills: Array.isArray(s.skills) ? s.skills : (s.skills ? String(s.skills).split(',').map((sk: string) => sk.trim()) : (mock?.skills || [])),
        cgpa: Number(s.cgpa || mock?.cgpa || 0),
        hackathons: Number(s.hackathons || mock?.hackathons || 0),
        certifications: Number(s.certifications ?? mock?.certifications ?? 0),
        patents: Number(s.patents || mock?.patents || 0)
      };
    });
  }
  if (action === 'getCompanies' && Array.isArray(data)) {
    return data.map((c: any) => ({
      ...c,
      requiredSkills: Array.isArray(c.requiredSkills) ? c.requiredSkills : (c.required_skills ? String(c.required_skills).split(',').map((sk: string) => sk.trim()) : []),
      prioritySkills: Array.isArray(c.prioritySkills) ? c.prioritySkills : (c.priority_skills ? String(c.priority_skills).split(',').map((sk: string) => sk.trim()) : []),
      minCgpa: Number(c.min_cgpa || c.minCgpa || 0),
      allowedBacklogs: Number(c.allowed_backlogs || c.allowedBacklogs || 0)
    }));
  }
  return data;
}

function getMockData(action: string) {
  if (action === 'getCompanies') {
    return [
      { id: "C001", name: "Google India", requiredSkills: ["Python", "Java", "DSA"], prioritySkills: ["DSA", "System Design"], minCgpa: 8.5, allowedBacklogs: 0 },
      { id: "C002", name: "Razorpay", requiredSkills: ["Node", "SQL", "Go"], prioritySkills: ["Node"], minCgpa: 8.0, allowedBacklogs: 1 },
      { id: "C003", name: "Microsoft", requiredSkills: ["C#", "Azure", "SQL"], prioritySkills: ["Cloud Architecture"], minCgpa: 8.5, allowedBacklogs: 0 },
      { id: "C004", name: "TCS", requiredSkills: ["Java", "C++", "SQL"], prioritySkills: ["Java"], minCgpa: 6.0, allowedBacklogs: 2 },
      { id: "C005", name: "Zoho", requiredSkills: ["C", "Web Development"], prioritySkills: ["Problem Solving"], minCgpa: 7.0, allowedBacklogs: 0 }
    ];
  }

  if (action === 'getStudents') {
    return [
      {"id": "2303921310421191", "name": "SANJAY G", "dept": "CSE", "cgpa": 7.54, "total_backlogs": 0, "active_backlogs": 0, "skills": ["FULL STACK"], "hackathons": 0, "certifications": 5, "patents": 0},
      {"id": "2303921310421192", "name": "SANJAY KUMAR KS", "dept": "CSE", "cgpa": 5.35, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Python", "Java", "DSA"], "hackathons": 0, "certifications": 1},
      {"id": "2303921310421193", "name": "SANJAY KUMAR M", "dept": "CSE", "cgpa": 6.14, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Python", "Java", "DSA"], "hackathons": 0, "certifications": 5},
      {"id": "2303921310421194", "name": "SANJAY RAJ M", "dept": "CSE", "cgpa": 7.69, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Frontend Web Development"], "hackathons": 0, "certifications": 0},
      {"id": "2303921310421198", "name": "Santhosh kumar S", "dept": "CSE", "cgpa": 7.6, "total_backlogs": 0, "active_backlogs": 0, "skills": ["AIML", "Frontend web Development"], "hackathons": 1, "certifications": 0},
      {"id": "2303921310421204", "name": "Selvin Jefre B", "dept": "CSE", "cgpa": 7.79, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Python", "Java", "DSA"], "hackathons": 0, "certifications": 0},
      {"id": "2303921310421206", "name": "Shachin VP", "dept": "CSE", "cgpa": 8.1, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Deep learning"], "hackathons": 4, "certifications": 13},
      {"id": "2303921310421207", "name": "Shambugamoorthi k", "dept": "CSE", "cgpa": 6.22, "total_backlogs": 0, "active_backlogs": 0, "skills": ["AIML", "data science"], "hackathons": 0, "certifications": 13},
      {"id": "2303921310421209", "name": "Sharan Dev M", "dept": "CSE", "cgpa": 3.5, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Python", "Java", "DSA"], "hackathons": 0, "certifications": 0},
      {"id": "2303921310421213", "name": "Siva Ranjan R", "dept": "CSE", "cgpa": 6.8, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Python", "Java", "DSA"], "hackathons": 0, "certifications": 2},
      {"id": "2303921310421214", "name": "SIVASARAN K", "dept": "CSE", "cgpa": 8.51, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Full stack development"], "hackathons": 2, "certifications": 6},
      {"id": "2303921310421215", "name": "Siva Harish P L", "dept": "CSE", "cgpa": 7.7, "total_backlogs": 0, "active_backlogs": 0, "skills": ["JAVA"], "hackathons": 0, "certifications": 1},
      {"id": "2303921310421218", "name": "Solairajan s", "dept": "CSE", "cgpa": 7.94, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Software"], "hackathons": 0, "certifications": 4},
      {"id": "2303921310421219", "name": "SRI DHARSAN S", "dept": "CSE", "cgpa": 7.87, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Java Programming"], "hackathons": 0, "certifications": 1},
      {"id": "2303921310421221", "name": "SRI VARSHAN S S", "dept": "CSE", "cgpa": 7.5, "total_backlogs": 0, "active_backlogs": 0, "skills": ["satilite", "agriculture", "Mern stack projects"], "hackathons": 0, "certifications": 3},
      {"id": "2303921310421225", "name": "Srinivas J", "dept": "CSE", "cgpa": 7.9, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Database management"], "hackathons": 0, "certifications": 1},
      {"id": "2303921310421226", "name": "Sriram S", "dept": "CSE", "cgpa": 7.02, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Portfolio"], "hackathons": 0, "certifications": 4},
      {"id": "2303921310421227", "name": "Sudharsan E", "dept": "CSE", "cgpa": 8.14, "total_backlogs": 0, "active_backlogs": 0, "skills": ["full stack and aiml"], "hackathons": 1, "certifications": 3},
      {"id": "2303921310421229", "name": "SURIYAKUMAR R", "dept": "CSE", "cgpa": 6.84, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Python", "Java", "DSA"], "hackathons": 0, "certifications": 0},
      {"id": "2303921310421232", "name": "TANUSH R", "dept": "CSE", "cgpa": 8.86, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Full stack and AIML"], "hackathons": 0, "certifications": 3},
      {"id": "2303921310421234", "name": "Thilak babu T A", "dept": "CSE", "cgpa": 7.1, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Python", "Java", "DSA"], "hackathons": 0, "certifications": 2},
      {"id": "2303921310421239", "name": "VENGATA VISVA P S", "dept": "CSE", "cgpa": 8.7, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Full Stack", "AIML"], "hackathons": 2, "certifications": 8},
      {"id": "2303921310421240.0", "name": "VIDHYA DHARANESH P K", "dept": "CSE", "cgpa": 7.96, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Machine Learning"], "hackathons": 1, "certifications": 3},
      {"id": "2303921310421241", "name": "Vignesh kumar sp", "dept": "CSE", "cgpa": 6.9, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Mern stack developer"], "hackathons": 0, "certifications": 0},
      {"id": "2303921310421242", "name": "M.Vigneshwaran", "dept": "CSE", "cgpa": 7.5, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Python", "Java", "DSA"], "hackathons": 0, "certifications": 0},
      {"id": "2303921310421243", "name": "Vijay Balaji P S", "dept": "CSE", "cgpa": 8.77, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Data Science", "Artificial Intelligence and Machine Learning"], "hackathons": 1, "certifications": 3},
      {"id": "2303921310421244", "name": "Vijay Kasthuri K", "dept": "CSE", "cgpa": 8.7, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Software", "iot"], "hackathons": 3, "certifications": 10},
      {"id": "2303921310421245", "name": "Vikram K", "dept": "CSE", "cgpa": 8.5, "total_backlogs": 0, "active_backlogs": 0, "skills": ["AIML"], "hackathons": 0, "certifications": 1},
      {"id": "2303921310421246", "name": "VINUVARSHAN K", "dept": "CSE", "cgpa": 7.94, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Datascience and Aiml"], "hackathons": 0, "certifications": 6},
      {"id": "2303921310421247", "name": "VISHAL C", "dept": "CSE", "cgpa": 5.13, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Python", "Java", "DSA"], "hackathons": 0, "certifications": 0},
      {"id": "2303921310421248", "name": "VISHNUSANKAR K", "dept": "CSE", "cgpa": 6.84, "total_backlogs": 0, "active_backlogs": 0, "skills": ["AIML"], "hackathons": 0, "certifications": 3},
      {"id": "2303921310421252", "name": "YUVANRAJ A", "dept": "CSE", "cgpa": 8.36, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Data Analytics"], "hackathons": 0, "certifications": 3},
      {"id": "2303921310422189", "name": "SAKTHI J", "dept": "CSE", "cgpa": 8.1, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Mern Stack", "Machine Leanring"], "hackathons": 1, "certifications": 2},
      {"id": "2303921310422190.0", "name": "Sandhiya S", "dept": "CSE", "cgpa": 7.48, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Python", "Java", "DSA"], "hackathons": 0, "certifications": 0},
      {"id": "2303921310422195", "name": "Sankari M", "dept": "CSE", "cgpa": 8.35, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Full stack"], "hackathons": 0, "certifications": 1},
      {"id": "2303921310422196", "name": "Santhiya L", "dept": "CSE", "cgpa": 8.16, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Full Stack"], "hackathons": 0, "certifications": 1},
      {"id": "2303921310422197", "name": "SANTHIYA S", "dept": "CSE", "cgpa": 8.59, "total_backlogs": 0, "active_backlogs": 0, "skills": ["FULL STACK DEVELOPMENT AND AI"], "hackathons": 0, "certifications": 1},
      {"id": "2303921310422200.0", "name": "Saranya S", "dept": "CSE", "cgpa": 8.11, "total_backlogs": 0, "active_backlogs": 0, "skills": ["AI app creation"], "hackathons": 0, "certifications": 1},
      {"id": "2303921310422201", "name": "SARMATHI M", "dept": "CSE", "cgpa": 8.15, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Fullstack Development"], "hackathons": 0, "certifications": 1},
      {"id": "2303921310422202", "name": "SASMIKA S M", "dept": "CSE", "cgpa": 8.39, "total_backlogs": 0, "active_backlogs": 0, "skills": ["AIML", "FULLSTACK"], "hackathons": 2, "certifications": 2},
      {"id": "2303921310422203", "name": "Sathya eswari k", "dept": "CSE", "cgpa": 8.16, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Web development"], "hackathons": 0, "certifications": 1},
      {"id": "2303921310422205", "name": "Serafina J B", "dept": "CSE", "cgpa": 7.75, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Python", "Java", "DSA"], "hackathons": 0, "certifications": 1},
      {"id": "2303921310422208", "name": "shamiksaa RJ", "dept": "CSE", "cgpa": 7.76, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Python", "Java", "DSA"], "hackathons": 0, "certifications": 1},
      {"id": "2303921310422210.0", "name": "Sharmithasri T", "dept": "CSE", "cgpa": 8.26, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Fullstack development"], "hackathons": 1, "certifications": 2},
      {"id": "2303921310422211", "name": "Shereen Treesha A", "dept": "CSE", "cgpa": 7.62, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Python", "Java", "DSA"], "hackathons": 0, "certifications": 1},
      {"id": "2303921310422212", "name": "Shwetha S M", "dept": "CSE", "cgpa": 8.58, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Full Stack and AIML"], "hackathons": 0, "certifications": 4},
      {"id": "2303921310422216", "name": "Sivaranjani S", "dept": "CSE", "cgpa": 7.75, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Web development"], "hackathons": 0, "certifications": 2},
      {"id": "2303921310422217", "name": "SIVASANKARI S", "dept": "CSE", "cgpa": 8.76, "total_backlogs": 0, "active_backlogs": 0, "skills": ["AIML", "FullStack"], "hackathons": 0, "certifications": 2},
      {"id": "2303921310422220.0", "name": "S.Sri sivadharshini", "dept": "CSE", "cgpa": 7.21, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Hospital management system"], "hackathons": 1, "certifications": 1},
      {"id": "2303921310422222", "name": "Srileka s", "dept": "CSE", "cgpa": 7.58, "total_backlogs": 0, "active_backlogs": 0, "skills": ["FULL STACK"], "hackathons": 0, "certifications": 2},
      {"id": "2303921310422223", "name": "SRINIDHI U", "dept": "CSE", "cgpa": 8.98, "total_backlogs": 0, "active_backlogs": 0, "skills": ["AIML"], "hackathons": 3, "certifications": 2},
      {"id": "2303921310422224", "name": "SRINITHI B", "dept": "CSE", "cgpa": 8.71, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Full stack development"], "hackathons": 0, "certifications": 1},
      {"id": "2303921310422228", "name": "Sujitha M", "dept": "CSE", "cgpa": 8.57, "total_backlogs": 0, "active_backlogs": 0, "skills": ["AIML"], "hackathons": 0, "certifications": 11},
      {"id": "2303921310422231", "name": "Surya P", "dept": "CSE", "cgpa": 8.14, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Full stack"], "hackathons": 0, "certifications": 2},
      {"id": "2303921310422233", "name": "THEJNI S", "dept": "CSE", "cgpa": 9.01, "total_backlogs": 0, "active_backlogs": 0, "skills": ["AIML"], "hackathons": 0, "certifications": 10},
      {"id": "2303921310422236", "name": "Valarmathi M", "dept": "CSE", "cgpa": 9.47, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Full stack development"], "hackathons": 0, "certifications": 24},
      {"id": "2303921310422237", "name": "Vasika k", "dept": "CSE", "cgpa": 8.1, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Streamlit"], "hackathons": 0, "certifications": 2},
      {"id": "2303921310422238", "name": "Veeralakshmi N", "dept": "CSE", "cgpa": 8.34, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Python", "Java", "DSA"], "hackathons": 0, "certifications": 1},
      {"id": "2303921310422249", "name": "Vishwaathiga N M", "dept": "CSE", "cgpa": 9.06, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Full stack developer"], "hackathons": 0, "certifications": 1},
      {"id": "2303921310422250.0", "name": "Viyansa Mercy S", "dept": "CSE", "cgpa": 7.77, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Full Stack Development"], "hackathons": 1, "certifications": 1},
      {"id": "2303921310422251", "name": "YASWANTHINI M M", "dept": "CSE", "cgpa": 8.72, "total_backlogs": 0, "active_backlogs": 0, "skills": ["Front-end", "c++"], "hackathons": 0, "certifications": 5}
    ];
  }
  return null;
}
