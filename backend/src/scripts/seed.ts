import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';

async function main() {
  console.log('🔄 Starting clean database reset for InternFlow...');

  // 1. Clean out existing data in reverse foreign key order
  console.log('🗑️  Deleting existing records...');
  await prisma.internshipEvaluation.deleteMany({});
  await prisma.weeklyLog.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.jobPost.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.companyProfile.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✨ All old tables cleared successfully.');

  // 2. Hash default password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 3. Create Demo Company 1 (TechCorp)
  console.log('🏢 Creating TechCorp HR Account...');
  const hrUser1 = await prisma.user.create({
    data: {
      email: 'hr@techcorp.com',
      password: hashedPassword,
      name: 'Sarah Jenkins (HR Lead)',
      role: 'COMPANY_HR',
      companyProfile: {
        create: {
          companyName: 'TechCorp Solutions (Thailand)',
          industry: 'Cloud Software & Enterprise Solutions',
          website: 'https://techcorp.example.com',
          description: 'Leading regional cloud architecture and enterprise software consultancy.',
          address: 'AIA Sathorn Tower, 18th Floor, South Sathorn Rd, Yannawa, Sathon, Bangkok 10120',
          contactEmail: 'careers@techcorp.example.com',
          contactPhone: '+66 2 123 4567'
        }
      }
    },
    include: { companyProfile: true }
  });

  // 4. Create Demo Company 2 (Innovate Labs)
  console.log('🏢 Creating Innovate Labs HR Account...');
  const hrUser2 = await prisma.user.create({
    data: {
      email: 'hr@innovate.co',
      password: hashedPassword,
      name: 'David Chen (Talent Acquisition)',
      role: 'COMPANY_HR',
      companyProfile: {
        create: {
          companyName: 'Innovate Labs Co., Ltd.',
          industry: 'AI & Data Platforms',
          website: 'https://innovatelabs.example.com',
          description: 'High-growth technology firm specializing in generative AI and cloud infrastructure.',
          address: 'True Digital Park, West Wing, Sukhumvit 101, Phra Khanong, Bangkok 10260',
          contactEmail: 'talent@innovatelabs.example.com',
          contactPhone: '+66 2 987 6543'
        }
      }
    },
    include: { companyProfile: true }
  });

  // 5. Create Job Postings
  console.log('💼 Creating Job Postings...');
  const job1 = await prisma.jobPost.create({
    data: {
      companyProfileId: hrUser1.companyProfile!.id,
      title: 'Full-Stack Developer Intern',
      description: 'Join our agile core engineering team building high-performance cloud platforms with React, Node.js, and AWS.',
      requirements: '- Strong fundamentals in TypeScript, React, and REST APIs\n- Familiarity with PostgreSQL and Docker\n- Passion for clean code and modern web architectures',
      location: 'Bangkok (Sathorn) / Hybrid',
      isRemote: false,
      positions: 3,
      allowance: '18,000 THB / month',
      workingHours: 'Mon - Fri, 09:00 - 18:00',
      contactEmail: 'careers@techcorp.example.com',
      contactPhone: '+66 2 123 4567',
      contactLine: '@techcorp_careers',
      isActive: true
    }
  });

  const job2 = await prisma.jobPost.create({
    data: {
      companyProfileId: hrUser1.companyProfile!.id,
      title: 'Cloud & DevOps Engineering Intern',
      description: 'Gain hands-on experience designing and operating AWS cloud infrastructure with Terraform, Docker, and ECS Fargate.',
      requirements: '- Basic understanding of Linux, Docker, and CI/CD pipelines\n- Exposure to AWS primitives (VPC, ECS, S3, RDS)\n- Eagerness to learn site reliability engineering practices',
      location: 'Bangkok (Sathorn)',
      isRemote: false,
      positions: 2,
      allowance: '20,000 THB / month',
      workingHours: 'Mon - Fri, 09:30 - 18:30',
      contactEmail: 'careers@techcorp.example.com',
      contactPhone: '+66 2 123 4567',
      contactLine: '@techcorp_careers',
      isActive: true
    }
  });

  const job3 = await prisma.jobPost.create({
    data: {
      companyProfileId: hrUser2.companyProfile!.id,
      title: 'Frontend React Engineer Intern',
      description: 'Craft responsive, pixel-perfect user interfaces and dashboards using React 19, Tailwind CSS, and TypeScript.',
      requirements: '- Proficiency in modern JavaScript/TypeScript and React Hooks\n- Eye for design detail and CSS/Tailwind responsiveness\n- Knowledge of state management and REST API integration',
      location: 'Sukhumvit 101 / Remote',
      isRemote: true,
      positions: 2,
      allowance: '16,000 THB / month',
      workingHours: 'Mon - Fri, 10:00 - 19:00',
      contactEmail: 'talent@innovatelabs.example.com',
      contactPhone: '+66 2 987 6543',
      contactLine: '@innovate_talent',
      isActive: true
    }
  });

  // 6. Create Demo Student Account
  console.log('🎓 Creating Demo Student Account...');
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@internflow.com',
      password: hashedPassword,
      name: 'Alex Rivers',
      role: 'STUDENT',
      studentProfile: {
        create: {
          studentId: '6409612345',
          university: 'Thammasat University (SIIT)',
          faculty: 'School of Information, Computer and Communication Technology',
          major: 'Computer Engineering',
          year: 3,
          gpa: 3.75,
          skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Tailwind CSS'],
          bio: 'Passionate 3rd-year Computer Engineering student with a strong interest in cloud infrastructure and scalable full-stack web applications.'
        }
      }
    },
    include: { studentProfile: true }
  });

  // 7. Create Active Committed Placement at TechCorp and Auto-Closed Application at Innovate
  console.log('📝 Creating active committed placement for Alex Rivers at TechCorp...');
  const appTechCorp = await prisma.application.create({
    data: {
      studentId: studentUser.studentProfile!.id,
      jobPostId: job1.id,
      status: 'COMMITTED',
      coverLetter: 'I am excited to apply for the Full-Stack Developer Intern position at TechCorp Solutions. With my strong background in React, TypeScript, and modern relational database architectures, I am eager to contribute to your engineering team while learning industry best practices.'
    }
  });

  const appInnovate = await prisma.application.create({
    data: {
      studentId: studentUser.studentProfile!.id,
      jobPostId: job3.id,
      status: 'REJECTED',
      coverLetter: 'I am passionate about building responsive, high-performance web applications and design systems. I would love the opportunity to contribute to Innovate Labs.'
    }
  });

  // 8. Create Sample Week 1 Weekly Log for Alex Rivers
  console.log('📖 Creating sample Week 1 logbook entry...');
  await prisma.weeklyLog.create({
    data: {
      studentId: studentUser.studentProfile!.id,
      applicationId: appTechCorp.id,
      weekNumber: 1,
      startDate: new Date('2026-08-01T00:00:00Z'),
      endDate: new Date('2026-08-05T00:00:00Z'),
      workModality: 'ON_SITE',
      supervisorName: 'Sarah Jenkins (HR Lead / Engineering Mentor)',
      plannedTasks: JSON.stringify([
        'Onboarding and development workstation setup',
        'Review architecture documentation and database schemas',
        'Attend sprint kickoff meeting with full-stack team'
      ]),
      tasksDone: JSON.stringify([
        'Completed local Docker environment configuration for PostgreSQL',
        'Implemented authentication middleware and route guards',
        'Submitted initial pull request for UI components library'
      ]),
      problemsAndSolutions: 'Experienced CORS preflight issues during local API integration. Resolved by updating Express CORS origin headers.',
      learnings: 'Gained hands-on experience with TypeScript strict typing, Prisma client migrations, and RESTful API design.',
      hoursWorked: 40.0,
      mentorApproved: false
    }
  });

  console.log('✅ Database reset completed successfully!');
  console.log('----------------------------------------------------');
  console.log('🔑 Credentials Summary:');
  console.log('👨‍🎓 Student Account:');
  console.log('   Email:    student@internflow.com');
  console.log('   Password: password123');
  console.log('🏢 Company HR Account 1 (TechCorp):');
  console.log('   Email:    hr@techcorp.com');
  console.log('   Password: password123');
  console.log('🏢 Company HR Account 2 (Innovate Labs):');
  console.log('   Email:    hr@innovate.co');
  console.log('   Password: password123');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error resetting database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
