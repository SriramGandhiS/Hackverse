/**
 * Smart Placement Operating System (SPOS) - Backend (v2.6)
 * Deploy this as a Web App (Anyone with access: Anyone)
 * Target Spreadsheet: 1cSPoy-lmdwd_YZeK-d_v3PuRBHO0j-eh3dKkcB8RtHc
 */

const SPREADSHEET_ID = '1cSPoy-lmdwd_YZeK-d_v3PuRBHO0j-eh3dKkcB8RtHc';

function doGet(e) {
  const action = e.parameter.action;
  const data = e.parameter.data ? JSON.parse(e.parameter.data) : {};
  
  try {
    let result;
    switch (action) {
      case 'getStudents':
        result = getStudents();
        break;
      case 'getCompanies':
        result = getCompanies();
        break;
      case 'apply':
        result = applyToJob(data);
        break;
      default:
        throw new Error('Invalid action');
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getStudents() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Students') || createStudentsSheet(ss);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  
  return values.slice(1).map(row => {
    let student = {};
    headers.forEach((header, i) => {
      let val = row[i];
      if (header === 'id') val = String(val).replace(/\.0$/, '');
      student[header] = val;
    });
    // Convert comma skills to array
    if (student.skills) student.skills = student.skills.split(',').map(s => s.trim());
    return student;
  });
}

function getCompanies() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Companies') || createCompaniesSheet(ss);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  
  return values.slice(1).map(row => {
    let company = {};
    headers.forEach((header, i) => {
      company[header] = row[i];
    });
    if (company.required_skills) company.required_skills = company.required_skills.split(',').map(s => s.trim());
    return company;
  });
}

function applyToJob(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Applications');
  if (!sheet) {
    sheet = ss.insertSheet('Applications');
    sheet.appendRow(['student_id', 'student_name', 'company_id', 'company_name', 'status', 'timestamp']);
  }
  sheet.appendRow([data.studentId, data.studentName, data.companyId, data.companyName, 'Applied', new Date()]);
  return { success: true };
}

/**
 * INITIAL SETUP: Run this function once in GAS to populate your Spreadsheet.
 */
function setup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Clear existing sheets to prevent duplicates
  ['Students', 'Companies', 'Applications'].forEach(name => {
    const s = ss.getSheetByName(name);
    if (s) ss.deleteSheet(s);
  });
  
  createStudentsSheet(ss);
  createCompaniesSheet(ss);
  
  // Applications will be created on first apply
  console.log("SUCCESS: Database populated with 62 students and 5 companies!");
}

function createStudentsSheet(ss) {
  const sheet = ss.insertSheet('Students');
  sheet.getRange("A:A").setNumberFormat("@"); // Format ID as string
  sheet.appendRow(['id', 'name', 'dept', 'cgpa', 'total_backlogs', 'active_backlogs', 'skills', 'hackathons', 'certifications', 'resume_link', 'githubLink', 'domain']);
  
  const students = [
    ["2303921310421191", "SANJAY G", "CSE", 7.54, 0, 0, "FULL STACK", 0, 5, "https://drive.google.com/drive/folders/1XHD95lOkw2_xCyS6nQHrc1phO8JDa2si", "https://github.com/Sanjay-30082005", "FULL STACK"],
    ["2303921310421192", "SANJAY KUMAR KS", "CSE", 5.35, 0, 0, "Python, Java, DSA", 0, 1, "", "", ""],
    ["2303921310421193", "SANJAY KUMAR M", "CSE", 6.14, 0, 0, "Python, Java, DSA", 0, 5, "", "", ""],
    ["2303921310421194", "SANJAY RAJ M", "CSE", 7.69, 0, 0, "Frontend Web Development", 0, 0, "", "https://github.com/Sanjayraj-17", ""],
    ["2303921310421198", "Santhosh kumar S", "CSE", 7.6, 0, 0, "AIML, Frontend web Development", 1, 0, "", "https://github.com/Psnastudent", ""],
    ["2303921310421204", "Selvin Jefre B", "CSE", 7.79, 0, 0, "Python, Java, DSA", 0, 0, "", "https://github.com/selvinjef123/Sel", ""],
    ["2303921310421206", "Shachin VP", "CSE", 8.1, 0, 0, "Deep learning", 4, 13, "", "https://github.com/Shachin-7", ""],
    ["2303921310421207", "Shambugamoorthi k", "CSE", 6.22, 0, 0, "AIML, data science", 0, 13, "", "https://github.com/Shambugamoorthi", ""],
    ["2303921310421209", "Sharan Dev M", "CSE", 3.5, 0, 0, "Python, Java, DSA", 0, 0, "", "", ""],
    ["2303921310421213", "Siva Ranjan R", "CSE", 6.8, 0, 0, "Python, Java, DSA", 0, 2, "", "https://github.com/", ""],
    ["2303921310421214", "SIVASARAN K", "CSE", 8.51, 0, 0, "Full stack development", 2, 6, "", "https://github.com/Sivasaran18", ""],
    ["2303921310421215", "Siva Harish P L", "CSE", 7.7, 0, 0, "JAVA", 0, 1, "", "https://github.com/Siva-Harish12", ""],
    ["2303921310421218", "Solairajan s", "CSE", 7.94, 0, 0, "Software", 0, 4, "", "https://github.com/Solairajan1509", ""],
    ["2303921310421219", "SRI DHARSAN S", "CSE", 7.87, 0, 0, "Java Programming", 0, 1, "", "https://github.com/sridharsan006", ""],
    ["2303921310421221", "SRI VARSHAN S S", "CSE", 7.5, 0, 0, "satilite, agriculture, Mern stack projects", 0, 3, "", "https://github.com/SRIVARSHANSS", ""],
    ["2303921310421225", "Srinivas J", "CSE", 7.9, 0, 0, "Database management", 0, 1, "", "https://github.com/srinivasJ29", ""],
    ["2303921310421226", "Sriram S", "CSE", 7.02, 0, 0, "Python, Java, DSA", 0, 4, "", "https://github.com/SriramGandhiS", ""],
    ["2303921310421227", "Sudharsan E", "CSE", 8.14, 0, 0, "full stack and aiml", 1, 3, "", "https://github.com/redeyeshu007", ""],
    ["2303921310421229", "SURIYAKUMAR R", "CSE", 6.84, 0, 0, "Python, Java, DSA", 0, 0, "", "", ""],
    ["2303921310421232", "TANUSH R", "CSE", 8.86, 0, 0, "Full stack and AIML", 0, 3, "", "https://github.com/Tanushr23cs", ""],
    ["2303921310421234", "Thilak babu T A", "CSE", 7.1, 0, 0, "Python, Java, DSA", 0, 2, "", "https://github.com/Thilak262006", ""],
    ["2303921310421239", "VENGATA VISVA P S", "CSE", 8.7, 0, 0, "Full Stack, AIML", 2, 8, "", "https://github.com/vengatavisva", ""],
    ["2303921310421240.0", "VIDHYA DHARANESH P K", "CSE", 7.96, 0, 0, "Machine Learning", 1, 3, "", "https://github.com/DharaneshV", ""],
    ["2303921310421241", "Vignesh kumar sp", "CSE", 6.9, 0, 0, "Mern stack developer", 0, 0, "", "https://github.com/Vigneshkumarsp0047", ""],
    ["2303921310421242", "M.Vigneshwaran", "CSE", 7.5, 0, 0, "Python, Java, DSA", 0, 0, "", "", ""],
    ["2303921310421243", "Vijay Balaji P S", "CSE", 8.77, 0, 0, "Data Science, Artificial Intelligence and Machine Learning", 1, 3, "", "https://github.com/vijaybalaji0606", ""],
    ["2303921310421244", "Vijay Kasthuri K", "CSE", 8.7, 0, 0, "Software, iot", 3, 10, "", "https://github.com/vijaykasthurik", ""],
    ["2303921310421245", "Vikram K", "CSE", 8.5, 0, 0, "AIML", 0, 1, "", "https://github.com/Vikram-18-K", ""],
    ["2303921310421246", "VINUVARSHAN K", "CSE", 7.94, 0, 0, "Datascience and Aiml", 0, 6, "", "https://github.com/Vinuvarshan", ""],
    ["2303921310421247", "VISHAL C", "CSE", 5.13, 0, 0, "Python, Java, DSA", 0, 0, "", "https://github.com/VISHAL111205", ""],
    ["2303921310421248", "VISHNUSANKAR K", "CSE", 6.84, 0, 0, "AIML", 0, 3, "", "https://github.com/VISHNUSANKAR07", ""],
    ["2303921310421252", "YUVANRAJ A", "CSE", 8.36, 0, 0, "Data Analytics", 0, 3, "", "https://github.com/Yuvanraj23", ""],
    ["2303921310422189", "SAKTHI J", "CSE", 8.1, 0, 0, "Mern Stack, Machine Leanring", 1, 2, "", "https://github.com/sakthijaw", ""],
    ["2303921310422190.0", "Sandhiya S", "CSE", 7.48, 0, 0, "Python, Java, DSA", 0, 0, "", "", ""],
    ["2303921310422195", "Sankari M", "CSE", 8.35, 0, 0, "Full stack", 0, 1, "", "https://github.com/Sankarimothilal", ""],
    ["2303921310422196", "Santhiya L", "CSE", 8.16, 0, 0, "Full Stack", 0, 1, "", "https://github.com/santhiyal27", ""],
    ["2303921310422197", "SANTHIYA S", "CSE", 8.59, 0, 0, "FULL STACK DEVELOPMENT AND AI", 0, 1, "", "https://github.com/santhiyasenthil12113", ""],
    ["2303921310422200.0", "Saranya S", "CSE", 8.11, 0, 0, "AI app creation", 0, 1, "", "https://github.com/saranyashasa", ""],
    ["2303921310422201", "SARMATHI M", "CSE", 8.15, 0, 0, "Fullstack Development", 0, 1, "", "https://github.com/SarmathiM", ""],
    ["2303921310422202", "SASMIKA S M", "CSE", 8.39, 0, 0, "AIML, FULLSTACK", 2, 2, "", "https://github.com/Sasmika2313", ""],
    ["2303921310422203", "Sathya eswari k", "CSE", 8.16, 0, 0, "Web development", 0, 1, "", "https://github.com/SathyaEswari-357", ""],
    ["2303921310422205", "Serafina J B", "CSE", 7.75, 0, 0, "Python, Java, DSA", 0, 1, "", "https://github.com/Serafina25", ""],
    ["2303921310422208", "shamiksaa RJ", "CSE", 7.76, 0, 0, "Python, Java, DSA", 0, 1, "", "https://github.com/shamiksaa-rj", ""],
    ["2303921310422210.0", "Sharmithasri T", "CSE", 8.26, 0, 0, "Fullstack development", 1, 2, "", "https://github.com/Sharmithasri", ""],
    ["2303921310422211", "Shereen Treesha A", "CSE", 7.62, 0, 0, "Python, Java, DSA", 0, 1, "", "https://github.com/Shereen-5", ""],
    ["2303921310422212", "Shwetha S M", "CSE", 8.58, 0, 0, "Full Stack and AIML", 0, 4, "", "https://github.com/shwetha-09", ""],
    ["2303921310422216", "Sivaranjani S", "CSE", 7.75, 0, 0, "Web development", 0, 2, "", "https://github.com/SivaranjaiSenthilkumar", ""],
    ["2303921310422217", "SIVASANKARI S", "CSE", 8.76, 0, 0, "AIML, FullStack", 0, 2, "", "https://github.com/Siva-123-Bi", ""],
    ["2303921310422220.0", "S.Sri sivadharshini", "CSE", 7.21, 0, 0, "Hospital management system, loan application", 1, 1, "", "https://github.com/your-srisivadharshinis", ""],
    ["2303921310422222", "Srileka s", "CSE", 7.58, 0, 0, "FULL STACK", 0, 2, "", "https://github.com/srileka07", ""],
    ["2303921310422223", "SRINIDHI U", "CSE", 8.98, 0, 0, "AIML", 3, 2, "", "https://share.google/kpGkLngp2FgvOSaTy", ""],
    ["2303921310422224", "SRINITHI B", "CSE", 8.71, 0, 0, "Full stack development and artificial intelligence", 0, 1, "", "https://github.com/SRINITHI-B0601", ""],
    ["2303921310422228", "Sujitha M", "CSE", 8.57, 1, 1, "AIML", 0, 11, "", "https://github.com/Sujithasaravanan1111", ""],
    ["2303921310422231", "Surya P", "CSE", 8.14, 0, 0, "Full stack", 0, 2, "", "https://github.com/Suryaperumal308", ""],
    ["2303921310422233", "THEJNI S", "CSE", 9.01, 0, 0, "AIML", 0, 10, "", "https://share.google/oQN8ZKq3NzKc8RlqB", ""],
    ["2303921310422236", "Valarmathi M", "CSE", 9.47, 0, 0, "Full stack development, AI, ML", 0, 24, "", "https://github.com/valarmathimanihandarajan", ""],
    ["2303921310422237", "Vasika k", "CSE", 8.1, 0, 0, "Streamlit", 0, 2, "", "https://github.com/vasika2005", ""],
    ["2303921310422238", "Veeralakshmi N", "CSE", 8.34, 0, 0, "Python, Java, DSA", 0, 1, "", "https://github.com/veeralakshmi2005", ""],
    ["2303921310422249", "Vishwaathiga N M", "CSE", 9.06, 0, 0, "Full stack developer", 0, 1, "", "https://github.com/Vishwaathiga", ""],
    ["2303921310422250.0", "Viyansa Mercy S", "CSE", 7.77, 0, 0, "Full Stack Development", 1, 1, "", "https://github.com/Viyansa", ""],
    ["2303921310422251", "YASWANTHINI M M", "CSE", 8.72, 0, 0, "Front-end, c++", 0, 5, "", "https://github.com/Yaswanthini11", ""]
  ];
  
  students.forEach(row => sheet.appendRow(row));
  return sheet;
}

function createCompaniesSheet(ss) {
  const sheet = ss.insertSheet('Companies');
  sheet.appendRow(['id', 'name', 'required_skills', 'priority_skills', 'min_cgpa', 'allowed_backlogs']);
  const data = [
    ["C001", "Google India", "Python, Java, DSA", "DSA, System Design", 7.5, 0],
    ["C002", "Razorpay", "Node, SQL, Go", "Node", 8.0, 1],
    ["C003", "Microsoft", "C#, Azure, SQL", "Cloud Architecture", 8.5, 0],
    ["C004", "TCS", "Java, C++, SQL", "Java", 6.0, 2],
    ["C005", "Zoho", "C, Web Development", "Problem Solving", 7.0, 0]
  ];
  data.forEach(row => sheet.appendRow(row));
  return sheet;
}
