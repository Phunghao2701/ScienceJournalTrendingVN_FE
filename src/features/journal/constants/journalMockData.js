/**
 * Mock Data dành cho Journal, Volume và Issue.
 * Cấu trúc thiết kế theo mô hình quan hệ ID để dễ dàng thực hiện Filter/Query tại FE.
 */

export const INITIAL_JOURNALS = [
  {
    id: "J01",
    title: "International Journal of Computer Science & Trends",
    subjectCategory: "Computer Science",
    subjectArea: "Artificial Intelligence",
    issn: "1937-4771",
    onlineIssn: "1937-478X",
    publisher: "ResearchPulse Press",
    country: "Vietnam",
    editorInChief: "Dr. Nguyen Van A",
    lastUpdated: "2026-06-10",
    status: "Active",
    aimScope: "This journal focuses on the latest trends in AI, Machine Learning, and Software Engineering.",
    visibility: "Public",
    broadCategory: "Technology",
    specificResearchArea: "Neural Networks"
  },
  {
    id: "J02",
    title: "Journal of Climate Change and Environmental Engineering",
    subjectCategory: "Environmental Science",
    subjectArea: "Renewable Energy",
    issn: "2047-3214",
    onlineIssn: "2047-3222",
    publisher: "FPT University Publisher",
    country: "Vietnam",
    editorInChief: "Prof. Le Thi B",
    lastUpdated: "2026-05-28",
    status: "Draft",
    aimScope: "Focusing on global warming solutions and sustainable engineering.",
    visibility: "Private",
    broadCategory: "Science",
    specificResearchArea: "Solar Energy"
  },
  {
    id: "J03",
    title: "IEEE Transactions on Software Engineering & Cloud Computing",
    subjectCategory: "Computer Science",
    subjectArea: "Software Engineering",
    issn: "0098-5589",
    onlineIssn: "1937-479Y",
    publisher: "IEEE Computer Society",
    country: "USA",
    editorInChief: "Prof. John Smith",
    lastUpdated: "2026-06-01",
    status: "Active",
    aimScope: "Focusing on advanced software metrics, architectures, and cloud deployments.",
    visibility: "Public",
    broadCategory: "Technology",
    specificResearchArea: "Cloud Systems"
  },
  {
    id: "J04",
    title: "International Journal of Medical Informatics and Health Trends",
    subjectCategory: "Medical Science",
    subjectArea: "Health Informatics",
    issn: "1386-5056",
    onlineIssn: "1872-8243",
    publisher: "Elsevier",
    country: "Netherlands",
    editorInChief: "Dr. Sarah Jenkins",
    lastUpdated: "2026-05-15",
    status: "Active",
    aimScope: "Research at the intersection of computer science, data analytics, and healthcare.",
    visibility: "Public",
    broadCategory: "Medical Science",
    specificResearchArea: "Data Analytics"
  },
  {
    id: "J05",
    title: "Journal of Social Sciences, Digital Culture and Education",
    subjectCategory: "Social Sciences",
    subjectArea: "Digital Education",
    issn: "2158-2440",
    onlineIssn: "2158-245X",
    publisher: "Sage Publications",
    country: "United Kingdom",
    editorInChief: "Prof. Alan Turing",
    lastUpdated: "2026-06-12",
    status: "Draft",
    aimScope: "Examining the impact of virtual learning environments on modern social behavior.",
    visibility: "Private",
    broadCategory: "Social Sciences",
    specificResearchArea: "E-Learning"
  },
  {
    id: "J06",
    title: "Advanced Materials and Nano-Engineering Letters",
    subjectCategory: "Environmental Science",
    subjectArea: "Materials Science",
    issn: "1098-0121",
    onlineIssn: "1873-1123",
    publisher: "Springer Nature",
    country: "Germany",
    editorInChief: "Prof. Hans Müller",
    lastUpdated: "2026-04-12",
    status: "Active",
    aimScope: "International forum for publishing rapid communications on nano-structured surfaces.",
    visibility: "Public",
    broadCategory: "Science",
    specificResearchArea: "Nanotechnology"
  },
  {
    id: "J07",
    title: "Journal of Artificial Intelligence and Neural Networks",
    subjectCategory: "Computer Science",
    subjectArea: "Artificial Intelligence",
    issn: "0885-6125",
    onlineIssn: "1573-0565",
    publisher: "ResearchPulse Press",
    country: "Vietnam",
    editorInChief: "Dr. Le Hoang",
    lastUpdated: "2026-06-14",
    status: "Active",
    aimScope: "State-of-the-art research on deep learning architectures and reinforcement learning variants.",
    visibility: "Public",
    broadCategory: "Technology",
    specificResearchArea: "Deep Learning"
  },
  {
    id: "J08",
    title: "Global Environmental Law and Sustainable Policy Review",
    subjectCategory: "Social Sciences",
    subjectArea: "Environmental Law",
    issn: "1461-4529",
    onlineIssn: "1740-4827",
    publisher: "Oxford University Press",
    country: "United Kingdom",
    editorInChief: "Lady Elizabeth Stone",
    lastUpdated: "2026-03-30",
    status: "Draft",
    aimScope: "Analyzing transnational legislation regarding carbon footprints and international eco-policies.",
    visibility: "Private",
    broadCategory: "Social Sciences",
    specificResearchArea: "Eco-Law"
  },
  {
    id: "J09",
    title: "International Journal of Robotics and Automation Systems",
    subjectCategory: "Computer Science",
    subjectArea: "Robotics",
    issn: "0278-3649",
    onlineIssn: "1552-3098",
    publisher: "IEEE Computer Society",
    country: "Japan",
    editorInChief: "Prof. Kenji Takahashi",
    lastUpdated: "2026-05-22",
    status: "Active",
    aimScope: "Focusing on autonomous drones, human-robot interaction loops, and spatial kinematics.",
    visibility: "Public",
    broadCategory: "Technology",
    specificResearchArea: "Automation"
  },
  {
    id: "J10",
    title: "Annals of Clinical Oncology and Biomedical Therapeutics",
    subjectCategory: "Medical Science",
    subjectArea: "Oncology",
    issn: "0360-3016",
    onlineIssn: "1879-355X",
    publisher: "Elsevier",
    country: "USA",
    editorInChief: "Dr. Robert Vance",
    lastUpdated: "2026-06-11",
    status: "Active",
    aimScope: "Peer-reviewed research detailing target therapies, genetic mapping, and clinical trial phases.",
    visibility: "Public",
    broadCategory: "Medical Science",
    specificResearchArea: "Cancer Research"
  },
  {
    id: "J11",
    title: "Theoretical Computer Science and Cryptography Digest",
    subjectCategory: "Computer Science",
    subjectArea: "Cybersecurity",
    issn: "0304-3975",
    onlineIssn: "1879-2294",
    publisher: "Wiley-Blackwell",
    country: "Switzerland",
    editorInChief: "Dr. Alice Cipher",
    lastUpdated: "2026-05-02",
    status: "Draft",
    aimScope: "Mathematical structures in computing, quantum cryptography protocols, and complexity bounds.",
    visibility: "Private",
    broadCategory: "Technology",
    specificResearchArea: "Cryptography"
  },
  {
    id: "J12",
    title: "Renewable Energy Economics and Infrastructure Journal",
    subjectCategory: "Environmental Science",
    subjectArea: "Renewable Energy",
    issn: "0960-1481",
    onlineIssn: "1879-0682",
    publisher: "FPT University Publisher",
    country: "Vietnam",
    editorInChief: "Prof. Tran Minh Tri",
    lastUpdated: "2026-06-05",
    status: "Active",
    aimScope: "Economic valuation models for micro-grids, solar storage scaling, and regional power setups.",
    visibility: "Public",
    broadCategory: "Science",
    specificResearchArea: "Solar Grid"
  }
];

export const INITIAL_VOLUMES = [
  // J01 - 10 Volumes for Pagination & Grid Testing
  { id: "V01", journalId: "J01", volumeNumber: "Volume 1", publicationYear: 2023, period: "Jan — Jun 2023", totalIssues: 2, totalArticles: 24, frequency: "Quarterly", description: "First official volume of computer science trends" },
  { id: "V02", journalId: "J01", volumeNumber: "Volume 2", publicationYear: 2023, period: "Jul — Dec 2023", totalIssues: 1, totalArticles: 12, frequency: "Quarterly", description: "Focusing on 2018 computational models" },
  { id: "V04", journalId: "J01", volumeNumber: "Volume 3", publicationYear: 2024, period: "Jan — Apr 2024", totalIssues: 4, totalArticles: 48, frequency: "Quarterly", description: "Full year software engineering track" },
  { id: "V05", journalId: "J01", volumeNumber: "Volume 4", publicationYear: 2024, period: "May — Aug 2024", totalIssues: 2, totalArticles: 20, frequency: "Quarterly", description: "Computational science scaling report" },
  { id: "V06", journalId: "J01", volumeNumber: "Volume 5", publicationYear: 2024, period: "Sep — Dec 2024", totalIssues: 3, totalArticles: 30, frequency: "Quarterly", description: "Focusing on early deep learning architectures" },
  { id: "V11", journalId: "J01", volumeNumber: "Volume 6", publicationYear: 2025, period: "Jan — Apr 2025", totalIssues: 2, totalArticles: 22, frequency: "Quarterly", description: "Advanced machine learning research" },
  { id: "V12", journalId: "J01", volumeNumber: "Volume 7", publicationYear: 2025, period: "May — Aug 2025", totalIssues: 4, totalArticles: 44, frequency: "Quarterly", description: "Large language models overview" },
  { id: "V13", journalId: "J01", volumeNumber: "Volume 8", publicationYear: 2025, period: "Sep — Dec 2025", totalIssues: 1, totalArticles: 10, frequency: "Quarterly", description: "Generative AI applications digest" },
  { id: "V14", journalId: "J01", volumeNumber: "Volume 9", publicationYear: 2026, period: "Jan — Jun 2026", totalIssues: 3, totalArticles: 36, frequency: "Quarterly", description: "Transformers and attention systems review" },
  { id: "V15", journalId: "J01", volumeNumber: "Volume 10", publicationYear: 2026, period: "Jul — Dec 2026", totalIssues: 2, totalArticles: 24, frequency: "Quarterly", description: "Current year state-of-the-art developments" },

  // J02 - Environmental Science
  { id: "V03", journalId: "J02", volumeNumber: "Volume 1", publicationYear: 2025, totalIssues: 0, totalArticles: 0, frequency: "Bi-annual", description: "Initial setup volume" },
  { id: "V07", journalId: "J02", volumeNumber: "Volume 2", publicationYear: 2026, totalIssues: 1, totalArticles: 8, frequency: "Bi-annual", description: "Extended environmental engineering study" },

  // Other Journals
  { id: "V08", journalId: "J03", volumeNumber: "Volume 1", publicationYear: 2025, totalIssues: 2, totalArticles: 30, frequency: "Bi-annual", description: "Inaugural issue on edge architectures" },
  { id: "V09", journalId: "J03", volumeNumber: "Volume 2", publicationYear: 2026, totalIssues: 2, totalArticles: 24, frequency: "Bi-annual", description: "Special issue on hybrid cloud methodologies" },
  { id: "V10", journalId: "J04", volumeNumber: "Volume 1", publicationYear: 2025, totalIssues: 4, totalArticles: 40, frequency: "Quarterly", description: "Inaugural volume for healthcare systems informatics" }
];

export const INITIAL_ISSUES = [
  // V01 (Volume 1 - 2023)
  { id: "I01", volumeId: "V01", issueName: "Special Issue on Deep Learning", issueNumber: "No. 1", publicationYear: 2023, status: "Published" },
  { id: "I02", volumeId: "V01", issueName: "Regular Issue", issueNumber: "No. 2", publicationYear: 2023, status: "Published" },
  { id: "I14", volumeId: "V01", issueName: "Computer Vision Developments", issueNumber: "No. 3", publicationYear: 2023, status: "Published" },
  
  // V02 (Volume 2 - 2023)
  { id: "I03", volumeId: "V02", issueName: "Trends in NLP", issueNumber: "No. 1", publicationYear: 2023, status: "Scheduled" },
  { id: "I15", volumeId: "V02", issueName: "Computational Linguistics Review", issueNumber: "No. 2", publicationYear: 2023, status: "Scheduled" },
  
  // V04 (Volume 3 - 2024)
  { id: "I04", volumeId: "V04", issueName: "Advanced Software Architectures", issueNumber: "No. 1", publicationYear: 2024, status: "Published" },
  { id: "I05", volumeId: "V04", issueName: "Cloud Deployments & Metrics", issueNumber: "No. 2", publicationYear: 2024, status: "Published" },
  { id: "I16", volumeId: "V04", issueName: "Microservices & Serverless paradigms", issueNumber: "No. 3", publicationYear: 2024, status: "Published" },
  
  // V05 (Volume 4 - 2024)
  { id: "I06", volumeId: "V05", issueName: "Edge Computing Trends", issueNumber: "No. 1", publicationYear: 2024, status: "Published" },
  { id: "I17", volumeId: "V05", issueName: "IoT Routing Protocols & Security", issueNumber: "No. 2", publicationYear: 2024, status: "Scheduled" },
  
  // V06 (Volume 5 - 2024) -> No Issues (Keep empty for "No issues found" test)
  
  // V11 (Volume 6 - 2025)
  { id: "I08", volumeId: "V11", issueName: "Reinforcement Learning Applications", issueNumber: "No. 1", publicationYear: 2025, status: "Published" },
  { id: "I09", volumeId: "V11", issueName: "Optimized Neural Architectures", issueNumber: "No. 2", publicationYear: 2025, status: "Published" },
  { id: "I18", volumeId: "V11", issueName: "Unsupervised representation studies", issueNumber: "No. 3", publicationYear: 2025, status: "Published" },
  
  // V12 (Volume 7 - 2025)
  { id: "I10", volumeId: "V12", issueName: "Large Language Models Evolution", issueNumber: "No. 1", publicationYear: 2025, status: "Published" },
  { id: "I19", volumeId: "V12", issueName: "Vector Databases & Semantic Search", issueNumber: "No. 2", publicationYear: 2025, status: "Scheduled" },
  
  // V13 (Volume 8 - 2025)
  { id: "I11", volumeId: "V13", issueName: "Text Generation & Diffusion Systems", issueNumber: "No. 1", publicationYear: 2025, status: "Scheduled" },
  { id: "I20", volumeId: "V13", issueName: "Multi-modal vision-language architectures", issueNumber: "No. 2", publicationYear: 2025, status: "Scheduled" },
  
  // V14 (Volume 9 - 2026)
  { id: "I12", volumeId: "V14", issueName: "Transformers in Action", issueNumber: "No. 1", publicationYear: 2026, status: "Published" },
  { id: "I21", volumeId: "V14", issueName: "State Space Models & Mamba Review", issueNumber: "No. 2", publicationYear: 2026, status: "Published" },
  { id: "I22", volumeId: "V14", issueName: "High throughput sequence modeling", issueNumber: "No. 3", publicationYear: 2026, status: "Scheduled" },
  
  // V15 (Volume 10 - 2026)
  { id: "I13", volumeId: "V15", issueName: "Future Computation Paradigm", issueNumber: "No. 1", publicationYear: 2026, status: "Scheduled" },
  { id: "I23", volumeId: "V15", issueName: "Quantum Computing Algorithms Digest", issueNumber: "No. 2", publicationYear: 2026, status: "Scheduled" }
];